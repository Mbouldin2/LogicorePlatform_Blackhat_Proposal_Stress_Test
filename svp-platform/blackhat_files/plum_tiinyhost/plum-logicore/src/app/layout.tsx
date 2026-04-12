import type { Metadata } from "next";
import { Share_Tech_Mono, Rajdhani, Exo_2 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  weight: ["200", "300", "400", "700", "900"],
  variable: "--font-exo-2",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BLACK HAT PROPOSAL STRESS TEST — FIRE SYSTEM C2 CYBERSECURITY",
  description: "redteam-dashboard v2",
  openGraph: {
    title: "BLACK HAT PROPOSAL STRESS TEST — FIRE SYSTEM C2 CYBERSECURITY",
    description: "redteam-dashboard v2",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} ${rajdhani.variable} ${exo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
