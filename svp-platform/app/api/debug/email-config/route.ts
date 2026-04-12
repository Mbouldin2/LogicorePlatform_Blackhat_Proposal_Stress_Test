import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email";

export const runtime = "nodejs";

/**
 * GET /api/debug/email-config
 * Diagnoses which Azure/email environment variables are present.
 * Does NOT expose secret values — only reports present/missing.
 */
export async function GET() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const fromEmail = process.env.SMTP_FROM_EMAIL;
  const fromName = process.env.SMTP_FROM_NAME;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const vars = {
    AZURE_TENANT_ID: tenantId ? `✓ set (${tenantId.substring(0, 8)}…)` : "✗ MISSING",
    AZURE_CLIENT_ID: clientId ? `✓ set (${clientId.substring(0, 8)}…)` : "✗ MISSING",
    AZURE_CLIENT_SECRET: clientSecret ? `✓ set (length: ${clientSecret.length})` : "✗ MISSING",
    SMTP_FROM_EMAIL: fromEmail ? `✓ set (${fromEmail})` : "✗ not set (will use default: nelinia@strategicvalueplus.com)",
    SMTP_FROM_NAME: fromName ? `✓ set (${fromName})` : "✗ not set (will use default: Strategic Value+)",
    NEXT_PUBLIC_APP_URL: appUrl ? `✓ set (${appUrl})` : "✗ not set (will use default: https://strategicvalueplus.com)",
  };

  const configured = isEmailConfigured();
  const missing = [
    !tenantId && "AZURE_TENANT_ID",
    !clientId && "AZURE_CLIENT_ID",
    !clientSecret && "AZURE_CLIENT_SECRET",
  ].filter(Boolean);

  return NextResponse.json({
    emailConfigured: configured,
    status: configured ? "✓ Email is configured and should work" : `✗ Email NOT configured — missing: ${missing.join(", ")}`,
    variables: vars,
    instructions: configured
      ? "Email should be sending. If still failing, check Azure app permissions: Mail.Send on Microsoft Graph."
      : `Add the missing environment variables to your Vercel project settings under Settings → Environment Variables, then redeploy.`,
  });
}
