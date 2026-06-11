"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Check, CreditCard, Loader2, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PLANS, type PlanId } from "@/lib/constants";
import { MOCK_USAGE } from "@/lib/mock-data";
import { formatNumber, cn } from "@/lib/utils";

const CURRENT: PlanId = "professional";

export default function BillingPage() {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const u = MOCK_USAGE;

  async function checkout(plan: PlanId) {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.message("Demo mode", { description: data.message ?? "Stripe is not configured." });
      }
    } catch {
      toast.error("Could not start checkout.");
    } finally {
      setLoading(null);
    }
  }

  const meters = [
    { label: "AI words", used: u.wordsUsed, limit: u.wordsLimit },
    { label: "Visual generations", used: u.imagesUsed, limit: u.imagesLimit },
    { label: "Team seats", used: u.seatsUsed, limit: u.seatsLimit },
  ];

  return (
    <>
      <PageHeader title="Billing & Subscription" description="Manage your plan, usage, and payment method." />
      <div className="space-y-6 p-6">
        {/* Current plan + usage */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Zap className="size-4 text-[var(--color-ink-600)]" /> Current usage</CardTitle>
              <Badge variant="default">Professional plan</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              {meters.map((m) => {
                const pct = Math.round((m.used / m.limit) * 100);
                return (
                  <div key={m.label}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium">{m.label}</span>
                      <span className="text-[var(--color-muted-foreground)]">{formatNumber(m.used)} / {formatNumber(m.limit)}</span>
                    </div>
                    <Progress value={pct} tone={pct > 85 ? "danger" : "brand"} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-4" /> Payment method</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[var(--radius)] border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Visa •••• 4242</span>
                  <Badge variant="muted">Default</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Expires 04/28</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => toast.success("Opening Stripe customer portal…")}>Manage payment</Button>
              <p className="text-center text-xs text-[var(--color-muted-foreground)]">Next invoice: Jul 11, 2026 · $79.00</p>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Change plan</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => {
              const isCurrent = p.id === CURRENT;
              return (
                <Card key={p.id} className={cn("flex flex-col p-5", p.highlight && "ring-2 ring-[var(--color-ink-500)]")}>
                  {p.badge && <Badge variant={p.highlight ? "default" : "muted"} className="mb-2 w-fit">{p.badge}</Badge>}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <div className="mt-1 text-2xl font-bold">${p.price}<span className="text-sm font-normal text-[var(--color-muted-foreground)]">/mo</span></div>
                  <ul className="mt-4 flex-1 space-y-2">
                    {p.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex gap-2 text-xs"><Check className="mt-0.5 size-3.5 shrink-0 text-[var(--color-success)]" /><span>{f}</span></li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4 w-full"
                    variant={isCurrent ? "outline" : p.highlight ? "primary" : "secondary"}
                    disabled={isCurrent || loading === p.id}
                    onClick={() => checkout(p.id)}
                  >
                    {loading === p.id && <Loader2 className="size-4 animate-spin" />}
                    {isCurrent ? "Current plan" : `Switch to ${p.name}`}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
