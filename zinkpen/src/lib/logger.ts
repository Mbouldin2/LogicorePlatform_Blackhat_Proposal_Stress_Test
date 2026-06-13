/* =============================================================================
   Structured logging + error capture.

   • Emits single-line JSON logs (easy to ship to any log aggregator).
   • captureException() centralizes error reporting and forwards to an external
     collector when ERROR_WEBHOOK_URL is set (Slack/Sentry-tunnel/any HTTP sink).
     For full Sentry, drop in @sentry/nextjs and call Sentry.captureException
     from here — the call sites don't change.
   • Never throws — observability must not break the request path.
   ============================================================================= */

type Level = "debug" | "info" | "warn" | "error";
export type LogContext = Record<string, unknown>;

function emit(level: Level, message: string, context?: LogContext) {
  try {
    const entry = { ts: new Date().toISOString(), level, message, ...(context ?? {}) };
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  } catch {
    /* logging must never throw */
  }
}

export const logger = {
  debug: (m: string, c?: LogContext) => emit("debug", m, c),
  info: (m: string, c?: LogContext) => emit("info", m, c),
  warn: (m: string, c?: LogContext) => emit("warn", m, c),
  error: (m: string, c?: LogContext) => emit("error", m, c),
};

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { message: typeof err === "string" ? err : JSON.stringify(err) };
}

/** Log an error and, if ERROR_WEBHOOK_URL is configured, forward it to an
 *  external collector. Fire-and-forget; safe to `void` at any call site. */
export async function captureException(err: unknown, context?: LogContext): Promise<void> {
  const error = serializeError(err);
  logger.error(String(error.message ?? "error"), { ...context, error });

  const url = process.env.ERROR_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "zinkpen",
        env: process.env.NODE_ENV,
        error,
        context: context ?? {},
        ts: new Date().toISOString(),
      }),
      cache: "no-store",
    });
  } catch {
    /* swallow — never let error reporting break the caller */
  }
}
