import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="gold">Simple, transparent pricing</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Choose your plan</h1>
        <p className="mt-3 text-[var(--color-muted-foreground)]">
          Every plan includes the full writing studio, grammar engine, and humanizer. Scale words, seats, and
          advanced suites as you grow.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col p-6 ${plan.highlight ? "ring-2 ring-[var(--color-ink-500)] shadow-[var(--shadow-pop)]" : ""}`}
          >
            {plan.badge && (
              <Badge variant={plan.highlight ? "default" : "muted"} className="mb-3 w-fit">
                {plan.badge}
              </Badge>
            )}
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="mt-1 min-h-10 text-sm text-[var(--color-muted-foreground)]">{plan.blurb}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-sm text-[var(--color-muted-foreground)]">/month</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-[var(--radius)] bg-[var(--color-canvas)] p-3 text-center text-xs">
              <div>
                <div className="font-semibold text-[var(--color-foreground)]">{formatNumber(plan.words)}</div>
                <div className="text-[var(--color-muted-foreground)]">words</div>
              </div>
              <div>
                <div className="font-semibold text-[var(--color-foreground)]">{formatNumber(plan.images)}</div>
                <div className="text-[var(--color-muted-foreground)]">visuals</div>
              </div>
              <div>
                <div className="font-semibold text-[var(--color-foreground)]">{plan.seats}</div>
                <div className="text-[var(--color-muted-foreground)]">seats</div>
              </div>
            </div>
            <Link href={`/signup?plan=${plan.id}`} className="mt-5">
              <Button variant={plan.highlight ? "primary" : "outline"} className="w-full">
                {plan.cta}
              </Button>
            </Link>
            <ul className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-success)]" />
                  <span className="text-[var(--color-foreground)]">{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl text-center">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
          {[
            { q: "Can I switch plans anytime?", a: "Yes. Upgrades apply instantly; downgrades take effect next cycle. Billing is prorated automatically through Stripe." },
            { q: "Which AI models do you use?", a: "ZinkPen routes across OpenAI, Anthropic, and Gemini, choosing the best model for each task — with private routing on Government." },
            { q: "Is my content secure?", a: "Content is encrypted in transit and at rest. Government plans support FedRAMP-aligned handling and on-prem routing." },
            { q: "Do you offer a free trial?", a: "Every paid plan starts with a no-card free trial. Explore the full dashboard in demo mode right now." },
          ].map((f) => (
            <Card key={f.q} className="p-5">
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">{f.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
