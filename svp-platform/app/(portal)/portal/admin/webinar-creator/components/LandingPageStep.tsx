"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WebinarDoc, WebinarBenefit, WebinarTimelinePhase, WebinarProcessStep, WebinarFAQ, WebinarTestimonial, WebinarRiskHighlight } from "@/lib/types/webinar";
import { BenefitListEditor, DynamicListEditor, SimpleListEditor, TextItemListEditor } from "./DynamicListEditor";
import { IconSelector } from "./IconSelector";
import { Layout, AlertTriangle, Star, Clock, HelpCircle, MessageSquare, Image } from "lucide-react";

interface LandingPageStepProps {
  webinar: Partial<WebinarDoc>;
  onChange: (updates: Partial<WebinarDoc>) => void;
}

/** Normalize image URL to ensure it starts with / or http */
function normalizeImageUrl(url: string | undefined): string {
  if (!url) return "";
  // Already absolute URL or starts with /
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  // Add leading slash for relative paths
  return `/${url}`;
}

export function LandingPageStep({ webinar, onChange }: LandingPageStepProps) {
  const [activeTab, setActiveTab] = useState("hero");

  const landingPage = webinar.landingPage || {
    hero: { headline: "", riskHighlights: [], primaryCtaText: "Register Now" },
    benefits: [],
  };

  const updateLandingPage = (updates: Partial<typeof landingPage>) => {
    onChange({
      landingPage: { ...landingPage, ...updates },
    });
  };

  const updateHero = (updates: Partial<typeof landingPage.hero>) => {
    updateLandingPage({
      hero: { ...landingPage.hero, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Hero Section
              </CardTitle>
              <CardDescription>
                The main banner section at the top of your landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Logo URL</Label>
                  <Input
                    value={landingPage.hero.primaryLogo || ""}
                    onChange={(e) => updateHero({ primaryLogo: e.target.value })}
                    placeholder="/images/logo.png"
                  />
                  {landingPage.hero.primaryLogo && (
                    <div className="mt-2 p-2 border rounded-md bg-muted/50">
                      <img
                        src={normalizeImageUrl(landingPage.hero.primaryLogo)}
                        alt="Primary Logo Preview"
                        className="max-h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Secondary Logo URL (for collaborations)</Label>
                  <Input
                    value={landingPage.hero.secondaryLogo || ""}
                    onChange={(e) => updateHero({ secondaryLogo: e.target.value })}
                    placeholder="/images/partner-logo.png"
                  />
                  {landingPage.hero.secondaryLogo && (
                    <div className="mt-2 p-2 border rounded-md bg-muted/50">
                      <img
                        src={normalizeImageUrl(landingPage.hero.secondaryLogo)}
                        alt="Secondary Logo Preview"
                        className="max-h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Collaboration Text</Label>
                  <Input
                    value={landingPage.hero.collaborationText || ""}
                    onChange={(e) => updateHero({ collaborationText: e.target.value })}
                    placeholder="e.g., Collaboration, Powered By, In Partnership With"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo Contrast Mode</Label>
                  <Select
                    value={landingPage.hero.logoContrast || "light"}
                    onValueChange={(value: "light" | "dark") => updateHero({ logoContrast: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contrast mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light logos (for dark backgrounds)</SelectItem>
                      <SelectItem value="dark">Dark logos (for light backgrounds)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose based on your background image brightness
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Urgency Badge Text</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="urgency-badge-toggle" className="text-sm text-muted-foreground">
                      {landingPage.hero.urgencyBadgeEnabled !== false ? "Visible" : "Hidden"}
                    </Label>
                    <Switch
                      id="urgency-badge-toggle"
                      checked={landingPage.hero.urgencyBadgeEnabled !== false}
                      onCheckedChange={(checked) => updateHero({ urgencyBadgeEnabled: checked })}
                    />
                  </div>
                </div>
                <Input
                  value={landingPage.hero.urgencyBadge || ""}
                  onChange={(e) => updateHero({ urgencyBadge: e.target.value })}
                  placeholder="e.g., ⚠️ PHASE 1 ENFORCEMENT NOW ACTIVE"
                  disabled={landingPage.hero.urgencyBadgeEnabled === false}
                />
              </div>

              <div className="space-y-2">
                <Label>Main Headline *</Label>
                <Textarea
                  value={landingPage.hero.headline || ""}
                  onChange={(e) => updateHero({ headline: e.target.value })}
                  placeholder="Register for the Next CMMC CyberSecurity Compliance Training Cohort"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Sub-headline</Label>
                <Textarea
                  value={landingPage.hero.subheadline || ""}
                  onChange={(e) => updateHero({ subheadline: e.target.value })}
                  placeholder="Don't lose your DoD contracts. Join the program and get certified in 90-180 days."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary CTA Button Text</Label>
                  <Input
                    value={landingPage.hero.primaryCtaText || ""}
                    onChange={(e) => updateHero({ primaryCtaText: e.target.value })}
                    placeholder="Register Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary CTA Button Text</Label>
                  <Input
                    value={landingPage.hero.secondaryCtaText || ""}
                    onChange={(e) => updateHero({ secondaryCtaText: e.target.value })}
                    placeholder="View Timeline"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Background Image URL
                </Label>
                <Input
                  value={landingPage.hero.backgroundImage || ""}
                  onChange={(e) => updateHero({ backgroundImage: e.target.value })}
                  placeholder="/images/hero-background.jpg"
                />
                {landingPage.hero.backgroundImage && (
                  <div className="mt-2 p-2 border rounded-md bg-muted/50">
                    <img
                      src={normalizeImageUrl(landingPage.hero.backgroundImage)}
                      alt="Background Preview"
                      className="max-h-32 w-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Risk Highlights
              </CardTitle>
              <CardDescription>
                Key risks or pain points to highlight in the hero section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicListEditor<WebinarRiskHighlight>
                items={landingPage.hero.riskHighlights || []}
                onChange={(riskHighlights) => updateHero({ riskHighlights })}
                addButtonText="Add Risk Highlight"
                emptyMessage="No risk highlights added"
                createNewItem={() => ({
                  id: `risk-${Date.now()}`,
                  icon: "AlertTriangle",
                  title: "",
                  description: "",
                })}
                renderItem={(item, _index, updateItem) => (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <IconSelector
                        label="Icon"
                        value={item.icon}
                        onChange={(icon) => updateItem({ icon })}
                      />
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => updateItem({ title: e.target.value })}
                          placeholder="e.g., Contract Disqualification"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem({ description: e.target.value })}
                        placeholder="e.g., Without proper SPRS scores"
                      />
                    </div>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Urgency Banner</CardTitle>
              <CardDescription>
                A highlighted banner below the hero section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Urgency Banner</Label>
                <Switch
                  checked={landingPage.urgencyBanner?.enabled || false}
                  onCheckedChange={(enabled) =>
                    updateLandingPage({
                      urgencyBanner: {
                        enabled,
                        headline: landingPage.urgencyBanner?.headline || "",
                        description: landingPage.urgencyBanner?.description || "",
                        ctaText: landingPage.urgencyBanner?.ctaText || "Act Now",
                      },
                    })
                  }
                />
              </div>

              {landingPage.urgencyBanner?.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Banner Headline</Label>
                    <Input
                      value={landingPage.urgencyBanner?.headline || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          urgencyBanner: { ...landingPage.urgencyBanner!, headline: e.target.value },
                        })
                      }
                      placeholder="Who Needs a CMMC Audit & Certification?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banner Description (optional intro text)</Label>
                    <Textarea
                      value={landingPage.urgencyBanner?.description || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          urgencyBanner: { ...landingPage.urgencyBanner!, description: e.target.value },
                        })
                      }
                      placeholder="Optional introductory text before the list items..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banner Items (bullet points)</Label>
                    <TextItemListEditor
                      items={landingPage.urgencyBanner?.items || []}
                      onChange={(items) =>
                        updateLandingPage({
                          urgencyBanner: { ...landingPage.urgencyBanner!, items },
                        })
                      }
                      placeholder="e.g., Handles Federal Contract Information (FCI) or Controlled Unclassified Information (CUI)"
                      addButtonText="Add Item"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Text (below items)</Label>
                    <Input
                      value={landingPage.urgencyBanner?.footerText || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          urgencyBanner: { ...landingPage.urgencyBanner!, footerText: e.target.value },
                        })
                      }
                      placeholder="If you make anything for anyone who makes anything for the DoD — CMMC affects you."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      value={landingPage.urgencyBanner?.ctaText || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          urgencyBanner: { ...landingPage.urgencyBanner!, ctaText: e.target.value },
                        })
                      }
                      placeholder="Act Now"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Benefits Section
              </CardTitle>
              <CardDescription>
                Highlight the key benefits of your program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title (optional)</Label>
                <Input
                  value={landingPage.benefitsSection?.title || ""}
                  onChange={(e) =>
                    updateLandingPage({
                      benefitsSection: {
                        ...landingPage.benefitsSection,
                        title: e.target.value,
                        items: landingPage.benefitsSection?.items || landingPage.benefits || [],
                      },
                    })
                  }
                  placeholder="e.g., Why Choose Our Program?"
                />
              </div>
              <div className="space-y-2">
                <Label>Section Description (optional)</Label>
                <Textarea
                  value={landingPage.benefitsSection?.description || ""}
                  onChange={(e) =>
                    updateLandingPage({
                      benefitsSection: {
                        ...landingPage.benefitsSection,
                        description: e.target.value,
                        items: landingPage.benefitsSection?.items || landingPage.benefits || [],
                      },
                    })
                  }
                  placeholder="A brief introduction to the benefits section..."
                  rows={2}
                />
              </div>
              <BenefitListEditor
                benefits={landingPage.benefits || []}
                onChange={(benefits) => updateLandingPage({ benefits })}
                title="Program Benefits"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Timeline Section
              </CardTitle>
              <CardDescription>
                Show a phased timeline or roadmap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Timeline Section</Label>
                <Switch
                  checked={landingPage.timeline?.enabled || false}
                  onCheckedChange={(enabled) =>
                    updateLandingPage({
                      timeline: {
                        enabled,
                        title: landingPage.timeline?.title || "Critical Compliance Timeline",
                        description: landingPage.timeline?.description || "",
                        phases: landingPage.timeline?.phases || [],
                      },
                    })
                  }
                />
              </div>

              {landingPage.timeline?.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={landingPage.timeline?.title || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          timeline: { ...landingPage.timeline!, title: e.target.value },
                        })
                      }
                      placeholder="Critical Compliance Timeline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea
                      value={landingPage.timeline?.description || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          timeline: { ...landingPage.timeline!, description: e.target.value },
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <DynamicListEditor<WebinarTimelinePhase>
                    items={landingPage.timeline?.phases || []}
                    onChange={(phases) =>
                      updateLandingPage({
                        timeline: { ...landingPage.timeline!, phases },
                      })
                    }
                    title="Timeline Phases"
                    addButtonText="Add Phase"
                    emptyMessage="No phases added"
                    createNewItem={() => ({
                      id: `phase-${Date.now()}`,
                      label: "Phase 1",
                      period: "",
                      status: "UPCOMING" as const,
                      title: "",
                      description: "",
                      isUrgent: false,
                    })}
                    renderItem={(item, _index, updateItem) => (
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Phase Label</Label>
                            <Input
                              value={item.label}
                              onChange={(e) => updateItem({ label: e.target.value })}
                              placeholder="Phase 1"
                            />
                          </div>
                          <div>
                            <Label>Period</Label>
                            <Input
                              value={item.period}
                              onChange={(e) => updateItem({ period: e.target.value })}
                              placeholder="Nov 2025 - Nov 2026"
                            />
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Select
                              value={item.status}
                              onValueChange={(value) => updateItem({ status: value as WebinarTimelinePhase["status"] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE NOW">ACTIVE NOW</SelectItem>
                                <SelectItem value="UPCOMING">UPCOMING</SelectItem>
                                <SelectItem value="PLANNED">PLANNED</SelectItem>
                                <SelectItem value="FULL ENFORCEMENT">FULL ENFORCEMENT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateItem({ title: e.target.value })}
                            placeholder="Initial Enforcement In Effect"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateItem({ description: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.isUrgent}
                            onCheckedChange={(isUrgent) => updateItem({ isUrgent })}
                          />
                          <Label>Mark as Urgent (highlighted)</Label>
                        </div>
                      </div>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Process Steps Section</CardTitle>
              <CardDescription>
                Show a step-by-step process or methodology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Process Steps Section</Label>
                <Switch
                  checked={landingPage.processSteps?.enabled || false}
                  onCheckedChange={(enabled) =>
                    updateLandingPage({
                      processSteps: {
                        enabled,
                        title: landingPage.processSteps?.title || "Our Process",
                        description: landingPage.processSteps?.description || "",
                        steps: landingPage.processSteps?.steps || [],
                      },
                    })
                  }
                />
              </div>

              {landingPage.processSteps?.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={landingPage.processSteps?.title || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          processSteps: { ...landingPage.processSteps!, title: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea
                      value={landingPage.processSteps?.description || ""}
                      onChange={(e) =>
                        updateLandingPage({
                          processSteps: { ...landingPage.processSteps!, description: e.target.value },
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <DynamicListEditor<WebinarProcessStep>
                    items={landingPage.processSteps?.steps || []}
                    onChange={(steps) =>
                      updateLandingPage({
                        processSteps: { ...landingPage.processSteps!, steps },
                      })
                    }
                    title="Steps"
                    addButtonText="Add Step"
                    emptyMessage="No steps added"
                    createNewItem={() => ({
                      id: `step-${Date.now()}`,
                      number: String((landingPage.processSteps?.steps?.length || 0) + 1),
                      icon: "CheckCircle",
                      title: "",
                      description: "",
                    })}
                    renderItem={(item, _index, updateItem) => (
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Step Number</Label>
                            <Input
                              value={item.number}
                              onChange={(e) => updateItem({ number: e.target.value })}
                              placeholder="1"
                            />
                          </div>
                          <IconSelector
                            label="Icon"
                            value={item.icon}
                            onChange={(icon) => updateItem({ icon })}
                          />
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => updateItem({ title: e.target.value })}
                              placeholder="Readiness Assessment"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={item.description}
                            onChange={(e) => updateItem({ description: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                FAQ Section
              </CardTitle>
              <CardDescription>
                Frequently asked questions about your program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable FAQ Section</Label>
                <Switch
                  checked={landingPage.faqs?.enabled || false}
                  onCheckedChange={(enabled) =>
                    updateLandingPage({
                      faqs: {
                        enabled,
                        items: landingPage.faqs?.items || [],
                      },
                    })
                  }
                />
              </div>

              {landingPage.faqs?.enabled && (
                <DynamicListEditor<WebinarFAQ>
                  items={landingPage.faqs?.items || []}
                  onChange={(items) =>
                    updateLandingPage({
                      faqs: { ...landingPage.faqs!, items },
                    })
                  }
                  title="Questions"
                  addButtonText="Add FAQ"
                  emptyMessage="No FAQs added"
                  createNewItem={() => ({
                    id: `faq-${Date.now()}`,
                    question: "",
                    answer: "",
                  })}
                  renderItem={(item, _index, updateItem) => (
                    <div className="grid gap-3">
                      <div>
                        <Label>Question</Label>
                        <Input
                          value={item.question}
                          onChange={(e) => updateItem({ question: e.target.value })}
                          placeholder="Do we really need certification?"
                        />
                      </div>
                      <div>
                        <Label>Answer</Label>
                        <Textarea
                          value={item.answer}
                          onChange={(e) => updateItem({ answer: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Testimonials Section
              </CardTitle>
              <CardDescription>
                Social proof and testimonials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Testimonials Section</Label>
                <Switch
                  checked={landingPage.testimonials?.enabled || false}
                  onCheckedChange={(enabled) =>
                    updateLandingPage({
                      testimonials: {
                        enabled,
                        items: landingPage.testimonials?.items || [],
                      },
                    })
                  }
                />
              </div>

              {landingPage.testimonials?.enabled && (
                <DynamicListEditor<WebinarTestimonial>
                  items={landingPage.testimonials?.items || []}
                  onChange={(items) =>
                    updateLandingPage({
                      testimonials: { ...landingPage.testimonials!, items },
                    })
                  }
                  title="Testimonials"
                  addButtonText="Add Testimonial"
                  emptyMessage="No testimonials added"
                  createNewItem={() => ({
                    id: `testimonial-${Date.now()}`,
                    title: "",
                    quote: "",
                    rating: 5,
                  })}
                  renderItem={(item, _index, updateItem) => (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Title/Source</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateItem({ title: e.target.value })}
                            placeholder="About Our Program"
                          />
                        </div>
                        <div>
                          <Label>Rating (1-5 stars)</Label>
                          <Select
                            value={String(item.rating)}
                            onValueChange={(value) => updateItem({ rating: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {"★".repeat(n)}{"☆".repeat(5 - n)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Quote</Label>
                        <Textarea
                          value={item.quote}
                          onChange={(e) => updateItem({ quote: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
