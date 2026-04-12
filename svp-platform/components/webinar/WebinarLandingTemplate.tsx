"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { WebinarDoc } from "@/lib/types/webinar";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  Users,
  Award,
  ArrowRight,
  Calendar,
  Target,
  Zap,
  Lock,
  Star,
  Building2,
  Briefcase,
  FileText,
  Heart,
  TrendingUp,
  DollarSign,
  Globe,
  Phone,
  Mail,
  MapPin,
  Settings,
  Lightbulb,
  Rocket,
  Flag,
  Trophy,
  ThumbsUp,
  Eye,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
  Users,
  Award,
  ArrowRight,
  Calendar,
  Target,
  Zap,
  Lock,
  Star,
  Building2,
  Briefcase,
  FileText,
  Heart,
  TrendingUp,
  DollarSign,
  Globe,
  Phone,
  Mail,
  MapPin,
  Settings,
  Lightbulb,
  Rocket,
  Flag,
  Trophy,
  ThumbsUp,
  Eye,
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || CheckCircle;
}

interface WebinarLandingTemplateProps {
  webinar: WebinarDoc;
}

export function WebinarLandingTemplate({ webinar }: WebinarLandingTemplateProps) {
  const landing = webinar.landingPage;
  const hero = landing.hero;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
        {hero.backgroundImage ? (
          <div className="absolute inset-0">
            <Image
              src={hero.backgroundImage}
              alt="Background"
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="container relative z-10 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logos */}
            {(hero.primaryLogo || hero.secondaryLogo) && (
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-center justify-center gap-6 md:gap-10">
                  {hero.primaryLogo && (
                    <Image
                      src={hero.primaryLogo}
                      alt="Logo"
                      width={120}
                      height={60}
                      className="h-12 md:h-16 w-auto object-contain"
                    />
                  )}
                  {hero.secondaryLogo && (
                    <Image
                      src={hero.secondaryLogo}
                      alt="Partner Logo"
                      width={160}
                      height={60}
                      className="h-12 md:h-16 w-auto object-contain"
                    />
                  )}
                </div>
                {hero.collaborationText && (
                  <p className="text-lg md:text-xl font-semibold text-white/90 mt-3 tracking-wide uppercase">
                    {hero.collaborationText}
                  </p>
                )}
              </div>
            )}

            {/* Urgency Badge */}
            {hero.urgencyBadge && hero.urgencyBadgeEnabled !== false && (
              <Badge className="mb-6 bg-red-600 text-white border-0 px-6 py-3 text-base font-bold animate-pulse shadow-lg shadow-red-500/50">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {hero.urgencyBadge}
              </Badge>
            )}

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl mb-8">
              {hero.headline}
            </h1>

            {/* Risk Highlights */}
            {hero.riskHighlights && hero.riskHighlights.length > 0 && (
              <div className="bg-red-900/80 border-2 border-red-500 rounded-xl p-6 mb-8 max-w-3xl mx-auto backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <h2 className="text-2xl font-bold text-red-300">IMMEDIATE RISKS</h2>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <ul className="text-left space-y-3 text-lg">
                  {hero.riskHighlights.map((risk) => {
                    const Icon = getIcon(risk.icon);
                    return (
                      <li key={risk.id} className="flex items-start gap-3">
                        <span className="text-red-400 font-bold">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span>
                          <strong className="text-red-300">{risk.title}</strong>
                          {risk.description && ` — ${risk.description}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Subheadline */}
            {hero.subheadline && (
              <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10">
                {hero.subheadline}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-xl px-10 py-7 font-bold shadow-lg shadow-primary/50"
                asChild
              >
                <Link href={`/webinars/${webinar.slug}/confirmation`}>
                  <Calendar className="w-6 h-6 mr-2" />
                  {hero.primaryCtaText || "Register Now"}
                </Link>
              </Button>
            </div>

            {hero.secondaryCtaText && (
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-gray-100 text-lg px-8 py-6 font-semibold"
                asChild
              >
                <Link href="#timeline">
                  {hero.secondaryCtaText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Urgency Banner */}
      {landing.urgencyBanner?.enabled && (
        <section className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-bold text-2xl">{landing.urgencyBanner.headline}</p>
                  <p className="text-red-100 text-lg">{landing.urgencyBanner.description}</p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 font-bold px-8 py-6 text-lg whitespace-nowrap"
                asChild
              >
                <Link href={`/webinars/${webinar.slug}/confirmation`}>
                  {landing.urgencyBanner.ctaText} →
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {landing.benefits && landing.benefits.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {landing.benefits.map((benefit) => {
                const Icon = getIcon(benefit.icon);
                return (
                  <Card key={benefit.id} className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {landing.timeline?.enabled && landing.timeline.phases && landing.timeline.phases.length > 0 && (
        <section id="timeline" className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <Badge variant="outline" className="mb-6 border-red-500/50 text-red-600">
                <Clock className="w-4 h-4 mr-2" />
                Time-Sensitive
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {landing.timeline.title}
              </h2>
              {landing.timeline.description && (
                <p className="text-xl text-gray-600">{landing.timeline.description}</p>
              )}
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {landing.timeline.phases.map((phase) => (
                <Card
                  key={phase.id}
                  className={`border-2 ${phase.isUrgent ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-shrink-0">
                        <Badge className={`${phase.isUrgent ? "bg-red-600" : "bg-slate-600"} text-white px-3 py-1`}>
                          {phase.status}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">
                            {phase.label}: {phase.title}
                          </h3>
                          <span className="text-gray-500 text-sm">({phase.period})</span>
                        </div>
                        <p className="text-gray-600">{phase.description}</p>
                      </div>
                      {phase.isUrgent && (
                        <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6" asChild>
                <Link href={`/webinars/${webinar.slug}/confirmation`}>
                  {hero.primaryCtaText || "Register Now"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Process Steps Section */}
      {landing.processSteps?.enabled && landing.processSteps.steps && landing.processSteps.steps.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {landing.processSteps.title}
              </h2>
              {landing.processSteps.description && (
                <p className="text-xl text-gray-600">{landing.processSteps.description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {landing.processSteps.steps.map((step) => {
                const Icon = getIcon(step.icon);
                return (
                  <Card key={step.id} className="border-2 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                          {step.number}
                        </div>
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section id="register" className="py-20 md:py-28 bg-slate-800">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Shield className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {hero.subheadline || "Join us and take the next step in your journey."}
            </p>
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 text-lg px-10 py-6 font-bold"
              asChild
            >
              <Link href={`/webinars/${webinar.slug}/confirmation`}>
                <Calendar className="w-5 h-5 mr-2" />
                {hero.primaryCtaText || "Register Now"}
              </Link>
            </Button>
            {webinar.participantLimit && (
              <p className="mt-6 text-gray-400 text-sm">
                Limited to {webinar.participantLimit} participants. Secure your place today.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {landing.faqs?.enabled && landing.faqs.items && landing.faqs.items.length > 0 && (
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Frequently Asked Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {landing.faqs.items.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    value={`faq-${index}`}
                    className="bg-white border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {landing.testimonials?.enabled && landing.testimonials.items && landing.testimonials.items.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {landing.testimonials.items.map((testimonial) => (
                  <Card key={testimonial.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">"{testimonial.quote}"</p>
                      <p className="font-bold text-primary">{testimonial.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-slate-900 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {hero.primaryLogo && (
              <Image
                src={hero.primaryLogo}
                alt="Logo"
                width={300}
                height={75}
                className="mx-auto mb-8 brightness-0 invert"
              />
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Contact Us Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              <strong>Don't Wait.</strong> Start Your Journey Now.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 font-bold"
              asChild
            >
              <Link href={`/webinars/${webinar.slug}/confirmation`}>
                <Calendar className="w-5 h-5 mr-2" />
                {hero.primaryCtaText || "Register Now"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
