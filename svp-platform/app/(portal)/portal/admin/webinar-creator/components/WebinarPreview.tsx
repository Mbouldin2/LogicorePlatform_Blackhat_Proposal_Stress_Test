"use client";

import type { WebinarDoc } from "@/lib/types/webinar";
import { getIconComponent } from "./IconSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Star, AlertTriangle, Clock, Shield, Lock, Calendar, Users } from "lucide-react";

/** Normalize image URL to ensure it starts with / or http */
function normalizeImageUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  return `/${url}`;
}

interface WebinarPreviewProps {
  webinar: Partial<WebinarDoc>;
  page: "landing" | "confirmation";
}

export function WebinarPreview({ webinar, page }: WebinarPreviewProps) {
  if (page === "landing") {
    return <LandingPagePreview webinar={webinar} />;
  }
  return <ConfirmationPagePreview webinar={webinar} />;
}

function LandingPagePreview({ webinar }: { webinar: Partial<WebinarDoc> }) {
  const landing = webinar.landingPage;
  const hero = landing?.hero;

  return (
    <div className="min-h-[500px]">
      {/* Hero Section */}
      <section
        className="relative py-16 px-6 text-white bg-cover bg-center"
        style={{
          backgroundImage: hero?.backgroundImage
            ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${normalizeImageUrl(hero.backgroundImage)}')`
            : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Logos */}
          {(hero?.primaryLogo || hero?.secondaryLogo) && (
            <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 px-4 py-2 rounded-lg ${
              hero.logoContrast === "dark" ? "bg-white/90" : ""
            }`}>
              {hero?.primaryLogo && (
                <img
                  src={normalizeImageUrl(hero.primaryLogo)}
                  alt="Primary Logo"
                  className="h-10 sm:h-12 object-contain"
                />
              )}
              {hero?.primaryLogo && hero?.secondaryLogo && hero?.collaborationText && (
                <span className={`text-xs sm:text-sm uppercase tracking-wider font-medium ${
                  hero.logoContrast === "dark" ? "text-gray-700" : "text-white"
                }`}>
                  {hero.collaborationText}
                </span>
              )}
              {hero?.secondaryLogo && (
                <img
                  src={normalizeImageUrl(hero.secondaryLogo)}
                  alt="Secondary Logo"
                  className="h-10 sm:h-12 object-contain"
                />
              )}
            </div>
          )}

          {hero?.urgencyBadge && (
            <Badge className="mb-4 bg-red-600 text-white border-0 px-4 py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {hero.urgencyBadge}
            </Badge>
          )}

          <h1 className="text-3xl font-bold mb-4">
            {hero?.headline || "Your Webinar Headline"}
          </h1>

          {hero?.subheadline && (
            <p className="text-lg text-gray-200 mb-6">{hero.subheadline}</p>
          )}

          {(hero?.riskHighlights?.length ?? 0) > 0 && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-left">
              <ul className="space-y-2">
                {hero?.riskHighlights?.map((risk) => {
                  const Icon = getIconComponent(risk.icon) || AlertTriangle;
                  return (
                    <li key={risk.id} className="flex items-start gap-2">
                      <Icon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
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

          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="bg-primary hover:bg-primary/90">
              {hero?.primaryCtaText || "Register Now"}
            </Button>
            {hero?.secondaryCtaText && (
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                {hero.secondaryCtaText}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Urgency Banner */}
      {landing?.urgencyBanner?.enabled && (
        <section className="bg-gradient-to-r from-amber-50 to-amber-100 border-y border-amber-200 py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{landing.urgencyBanner.headline}</h3>
            {landing.urgencyBanner.description && (
              <p className="text-gray-700 mb-4">{landing.urgencyBanner.description}</p>
            )}
            {(landing.urgencyBanner.items?.length ?? 0) > 0 && (
              <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                {landing.urgencyBanner.items?.map((item, index) => (
                  <li key={item.id || index}>{item.text}</li>
                ))}
              </ol>
            )}
            {landing.urgencyBanner.footerText && (
              <p className="text-gray-600 italic mb-4">{landing.urgencyBanner.footerText}</p>
            )}
            {landing.urgencyBanner.ctaText && (
              <Button className="bg-primary hover:bg-primary/90">
                {landing.urgencyBanner.ctaText}
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Benefits Section */}
      {(landing?.benefits?.length ?? 0) > 0 && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {landing?.benefits?.map((benefit) => {
                const Icon = getIconComponent(benefit.icon) || CheckCircle;
                return (
                  <Card key={benefit.id} className="border-2 hover:border-primary/40">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {landing?.timeline?.enabled && (landing?.timeline?.phases?.length ?? 0) > 0 && (
        <section className="py-12 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="outline" className="mb-4">
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </Badge>
              <h2 className="text-2xl font-bold">{landing.timeline.title}</h2>
              {landing.timeline.description && (
                <p className="text-gray-600 mt-2">{landing.timeline.description}</p>
              )}
            </div>
            <div className="space-y-4">
              {landing.timeline.phases?.map((phase) => (
                <Card
                  key={phase.id}
                  className={`border-2 ${phase.isUrgent ? "border-red-500 bg-red-50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Badge className={phase.isUrgent ? "bg-red-600" : "bg-slate-600"}>
                        {phase.status}
                      </Badge>
                      <div>
                        <p className="font-bold">
                          {phase.label}: {phase.title}
                        </p>
                        <p className="text-sm text-gray-500">{phase.period}</p>
                        <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Steps */}
      {landing?.processSteps?.enabled && (landing?.processSteps?.steps?.length ?? 0) > 0 && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">{landing.processSteps.title}</h2>
              {landing.processSteps.description && (
                <p className="text-gray-600 mt-2">{landing.processSteps.description}</p>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {landing.processSteps.steps?.map((step) => {
                const Icon = getIconComponent(step.icon) || CheckCircle;
                return (
                  <Card key={step.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {step.number}
                        </div>
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {landing?.faqs?.enabled && (landing?.faqs?.items?.length ?? 0) > 0 && (
        <section className="py-12 px-6 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {landing.faqs.items?.map((faq) => (
                <Card key={faq.id}>
                  <CardContent className="p-4">
                    <p className="font-semibold mb-2">{faq.question}</p>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {landing?.testimonials?.enabled && (landing?.testimonials?.items?.length ?? 0) > 0 && (
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {landing.testimonials.items?.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">"{testimonial.quote}"</p>
                    <p className="text-sm font-bold text-primary">{testimonial.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 px-6 bg-slate-800 text-white text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <Button className="bg-primary hover:bg-primary/90">
          {hero?.primaryCtaText || "Register Now"}
        </Button>
      </section>
    </div>
  );
}

function ConfirmationPagePreview({ webinar }: { webinar: Partial<WebinarDoc> }) {
  const confirmation = webinar.confirmationPage;
  const hero = confirmation?.hero;

  return (
    <div className="min-h-[500px]">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          {hero?.badgeText && (
            <Badge className="mb-4 bg-red-600 text-white border-0 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {hero.badgeText}
            </Badge>
          )}

          <div className="bg-green-600/20 border-2 border-green-500 rounded-xl p-6 mb-6">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h1 className="text-2xl font-bold">
              {hero?.headline || "Congratulations!"}
            </h1>
          </div>

          <h2 className="text-xl font-bold mb-2">
            {hero?.programTitle || "Program Title"}
          </h2>
          {hero?.tagline && (
            <p className="text-gray-300">{hero.tagline}</p>
          )}
        </div>
      </section>

      {/* Deliverables & Benefits */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Deliverables */}
          {(confirmation?.deliverables?.length ?? 0) > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Core Deliverables
              </h3>
              <div className="space-y-3">
                {confirmation?.deliverables?.map((item) => {
                  const Icon = getIconComponent(item.icon) || CheckCircle;
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{item.title}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Benefits & Investment */}
          <div className="space-y-6">
            {(confirmation?.benefits?.length ?? 0) > 0 && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Key Benefits
                  </h3>
                  <ul className="space-y-2">
                    {confirmation?.benefits?.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Investment Card */}
            <Card className="border-4 border-red-500 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-6 text-center">
                {confirmation?.investmentCard?.urgencyText && (
                  <div className="bg-red-600/20 border border-red-500 rounded px-3 py-1 mb-3 inline-block">
                    <p className="text-red-400 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {confirmation.investmentCard.urgencyText}
                    </p>
                  </div>
                )}
                <p className="text-gray-300 text-sm mb-1">
                  {confirmation?.investmentCard?.investmentLabel || "Your Investment"}
                </p>
                <div className="text-4xl font-bold mb-2">
                  {confirmation?.investmentCard?.price || "$0"}
                </div>
                {confirmation?.investmentCard?.savingsText && (
                  <p className="text-green-400 text-sm mb-3">
                    {confirmation.investmentCard.savingsText}
                  </p>
                )}
                {confirmation?.investmentCard?.paymentDetails && (
                  <p className="text-gray-400 text-xs mb-4">
                    {confirmation.investmentCard.paymentDetails}
                  </p>
                )}
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Lock className="w-4 h-4 mr-2" />
                  {confirmation?.investmentCard?.ctaText || "Secure Your Seat"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-6 bg-slate-900 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">
          {confirmation?.finalCta?.headline || "Ready to Begin?"}
        </h2>
        {confirmation?.finalCta?.subheadline && (
          <p className="text-lg text-gray-300 mb-4">
            {confirmation.finalCta.subheadline}
          </p>
        )}
        {confirmation?.finalCta?.description && (
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            {confirmation.finalCta.description}
          </p>
        )}
        <Button className="bg-primary hover:bg-primary/90">
          <Lock className="w-4 h-4 mr-2" />
          {confirmation?.finalCta?.ctaText || "Get Started"}
        </Button>

        {(confirmation?.finalCta?.trustIndicators?.length ?? 0) > 0 && (
          <div className="mt-8 flex items-center justify-center gap-6 text-gray-400">
            {confirmation?.finalCta?.trustIndicators?.map((indicator) => {
              const Icon = getIconComponent(indicator.icon) || Shield;
              return (
                <div key={indicator.id} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{indicator.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
