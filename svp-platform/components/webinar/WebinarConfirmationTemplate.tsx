"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WebinarDoc } from "@/lib/types/webinar";
import {
  Shield,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Star,
  Zap,
  Calendar,
  FileText,
  Target,
  Award,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  CheckCircle,
  Clock,
  Users,
  Lock,
  Star,
  Zap,
  Calendar,
  FileText,
  Target,
  Award,
  ArrowRight,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || CheckCircle;
}

interface WebinarConfirmationTemplateProps {
  webinar: WebinarDoc;
}

export function WebinarConfirmationTemplate({ webinar }: WebinarConfirmationTemplateProps) {
  const confirmation = webinar.confirmationPage;
  const hero = confirmation.hero;
  const landingHero = webinar.landingPage.hero;

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {hero.badgeText && hero.badgeEnabled !== false && (
              <Badge className="mb-6 bg-red-600 text-white border-0 px-4 py-2 text-sm font-semibold">
                <Users className="w-4 h-4 mr-2" />
                {hero.badgeText}
              </Badge>
            )}

            {(hero.logo || landingHero.primaryLogo) && (
              <div className="mb-8">
                <Image
                  src={hero.logo || landingHero.primaryLogo || ""}
                  alt="Logo"
                  width={300}
                  height={75}
                  className="mx-auto brightness-0 invert"
                />
              </div>
            )}

            <div className="bg-green-600/20 border-2 border-green-500 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {hero.headline}
              </h1>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {hero.programTitle}
            </h2>
            {hero.tagline && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {hero.tagline}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Program Details Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-6 border-primary/50 text-primary px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {webinar.duration || "Program Details"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Everything You Need to Succeed
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Core Deliverables */}
              {confirmation.deliverables && confirmation.deliverables.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    Core Deliverables
                  </h3>
                  <div className="space-y-4">
                    {confirmation.deliverables.map((item) => {
                      const Icon = getIcon(item.icon);
                      return (
                        <Card key={item.id} className="border-2 hover:border-primary/40 transition-colors">
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{item.title}</h4>
                              <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Key Benefits & Investment */}
              <div>
                {confirmation.benefits && confirmation.benefits.length > 0 && (
                  <>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Star className="w-8 h-8 text-primary" />
                      Key Benefits
                    </h3>
                    <Card className="border-2 border-primary/20 bg-primary/5 mb-8">
                      <CardContent className="p-6">
                        <ul className="space-y-4">
                          {confirmation.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-lg">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Investment Card */}
                <Card className="border-4 border-red-500 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                  {confirmation.investmentCard.urgencyText && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1">
                      LIMITED SPOTS
                    </div>
                  )}
                  <CardContent className="p-8 text-center">
                    {confirmation.investmentCard.urgencyText && (
                      <div className="bg-red-600/20 border border-red-500 rounded-lg px-4 py-2 mb-4 inline-block">
                        <p className="text-red-400 font-bold text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {confirmation.investmentCard.urgencyText}
                        </p>
                      </div>
                    )}
                    <p className="text-gray-300 mb-2 uppercase tracking-wide font-semibold">
                      {confirmation.investmentCard.investmentLabel}
                    </p>
                    <div className="text-6xl font-bold text-white mb-2">
                      {confirmation.investmentCard.price}
                    </div>
                    {confirmation.investmentCard.savingsText && (
                      <p className="text-green-400 font-semibold mb-4">
                        {confirmation.investmentCard.savingsText}
                      </p>
                    )}
                    {confirmation.investmentCard.paymentDetails && (
                      <p className="text-gray-400 text-sm mb-6">
                        {confirmation.investmentCard.paymentDetails}
                      </p>
                    )}
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 font-bold w-full"
                      asChild
                    >
                      <a
                        href={confirmation.investmentCard.ctaLink || webinar.paymentLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Lock className="w-5 h-5 mr-2" />
                        {confirmation.investmentCard.ctaText}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {confirmation.finalCta.headline}
            </h2>
            {confirmation.finalCta.subheadline && (
              <p className="text-xl text-gray-300 mb-8">
                {confirmation.finalCta.subheadline}
              </p>
            )}
            {confirmation.finalCta.description && (
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
                {confirmation.finalCta.description}
              </p>
            )}

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-xl px-12 py-8 font-bold shadow-lg shadow-primary/50"
              asChild
            >
              <a
                href={confirmation.investmentCard.ctaLink || webinar.paymentLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Lock className="w-6 h-6 mr-3" />
                {confirmation.finalCta.ctaText}
              </a>
            </Button>

            {confirmation.finalCta.trustIndicators && confirmation.finalCta.trustIndicators.length > 0 && (
              <div className="mt-12 flex items-center justify-center gap-8 text-gray-400 flex-wrap">
                {confirmation.finalCta.trustIndicators.map((indicator) => {
                  const Icon = getIcon(indicator.icon);
                  return (
                    <div key={indicator.id} className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span>{indicator.text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 bg-slate-950 text-gray-500 text-center text-sm">
        <div className="container">
          <p>
            Copyright {new Date().getFullYear()} | Strategic Value Plus Solutions, LLC (V+) |{" "}
            <Link href="/terms" className="hover:text-primary underline">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
