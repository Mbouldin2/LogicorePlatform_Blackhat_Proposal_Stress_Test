import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/constants";

const cols: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Writing Studio", href: "/signup" },
      { label: "Humanizer Engine", href: "/#humanizer" },
      { label: "Visual Studio", href: "/#visuals" },
      { label: "Proposals & GovCon", href: "/signup" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Consulting", href: "/signup" },
      { label: "Government Contracting", href: "/signup" },
      { label: "Finance", href: "/signup" },
      { label: "Education", href: "/signup" },
      { label: "Technology", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Security", href: "/" },
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-[var(--color-muted-foreground)]">{BRAND.subTagline}</p>
          <p className="mt-4 text-xs font-medium text-[var(--color-ink-600)]">{BRAND.award}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold">{c.title}</h4>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-[var(--color-muted-foreground)] sm:flex-row">
          <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
          <span>{BRAND.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
