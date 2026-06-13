import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BRAND } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/">
            <Logo size={32} />
          </Link>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden zp-gradient-brand lg:block">
        <div className="absolute inset-0 zp-grid-bg opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div />
          <div>
            <p className="text-2xl font-semibold leading-snug">
              &ldquo;ZinkPen replaced five subscriptions and doubled our content output. The humanizer alone is worth it.&rdquo;
            </p>
            <p className="mt-4 text-sm text-white/70">— VP Marketing, Government Services Firm</p>
          </div>
          <p className="text-sm text-white/70">{BRAND.tagline}</p>
        </div>
      </div>
    </div>
  );
}
