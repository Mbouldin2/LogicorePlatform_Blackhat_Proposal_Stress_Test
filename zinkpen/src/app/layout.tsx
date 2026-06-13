import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { BRAND } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.subTagline,
  applicationName: BRAND.name,
  keywords: [
    "AI writing",
    "content operating system",
    "AI humanizer",
    "grammar checker",
    "brand voice",
    "proposal writing",
    "GovCon",
    "SBIR",
    "social media graphics",
    "carousel generator",
  ],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.subTagline,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              border: "1px solid var(--color-border)",
            },
          }}
        />
      </body>
    </html>
  );
}
