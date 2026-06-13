import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";

/** Server-rendered 403 state for role-restricted pages. */
export function AccessDenied({
  title = "Access restricted",
  message,
  requiredRole,
}: {
  title?: string;
  message?: string;
  requiredRole?: string;
}) {
  return (
    <>
      <PageHeader title={title} description="You don't have permission to view this area." />
      <div className="p-6">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center shadow-[var(--shadow-card)]">
          <span className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-red-50 text-[var(--color-danger)]">
            <ShieldAlert className="size-6" />
          </span>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
            {message ??
              (requiredRole
                ? `This area requires the ${requiredRole} role or higher. Ask a workspace admin for access.`
                : "Ask a workspace admin to grant you access.")}
          </p>
          <Link href="/dashboard" className="mt-5">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
