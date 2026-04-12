"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { WebinarDoc, WebinarDeliverable, WebinarTrustIndicator } from "@/lib/types/webinar";
import { BenefitListEditor, DynamicListEditor, SimpleListEditor } from "./DynamicListEditor";
import { IconSelector } from "./IconSelector";
import { CheckCircle, Gift, DollarSign, Megaphone } from "lucide-react";

interface ConfirmationPageStepProps {
  webinar: Partial<WebinarDoc>;
  onChange: (updates: Partial<WebinarDoc>) => void;
}

export function ConfirmationPageStep({ webinar, onChange }: ConfirmationPageStepProps) {
  const confirmationPage = webinar.confirmationPage || {
    hero: { badgeText: "", headline: "", programTitle: "" },
    deliverables: [],
    benefits: [],
    investmentCard: {
      urgencyText: "",
      investmentLabel: "",
      price: "",
      ctaText: "Secure Your Seat",
      ctaLink: "",
    },
    finalCta: {
      headline: "",
      ctaText: "Get Started",
      trustIndicators: [],
    },
  };

  const updateConfirmationPage = (updates: Partial<typeof confirmationPage>) => {
    onChange({
      confirmationPage: { ...confirmationPage, ...updates },
    });
  };

  const updateHero = (updates: Partial<typeof confirmationPage.hero>) => {
    updateConfirmationPage({
      hero: { ...confirmationPage.hero, ...updates },
    });
  };

  const updateInvestmentCard = (updates: Partial<typeof confirmationPage.investmentCard>) => {
    updateConfirmationPage({
      investmentCard: { ...confirmationPage.investmentCard, ...updates },
    });
  };

  const updateFinalCta = (updates: Partial<typeof confirmationPage.finalCta>) => {
    updateConfirmationPage({
      finalCta: { ...confirmationPage.finalCta, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirmation Hero Section
          </CardTitle>
          <CardDescription>
            The congratulations message shown after registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Badge Text</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="badge-text-toggle" className="text-sm text-muted-foreground">
                  {confirmationPage.hero.badgeEnabled !== false ? "Visible" : "Hidden"}
                </Label>
                <Switch
                  id="badge-text-toggle"
                  checked={confirmationPage.hero.badgeEnabled !== false}
                  onCheckedChange={(checked) => updateHero({ badgeEnabled: checked })}
                />
              </div>
            </div>
            <Input
              value={confirmationPage.hero.badgeText || ""}
              onChange={(e) => updateHero({ badgeText: e.target.value })}
              placeholder="e.g., EACH COHORT IS LIMITED TO 15 PARTICIPANTS"
              disabled={confirmationPage.hero.badgeEnabled === false}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo URL (optional - uses landing page logo if empty)</Label>
            <Input
              value={confirmationPage.hero.logo || ""}
              onChange={(e) => updateHero({ logo: e.target.value })}
              placeholder="/images/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label>Congratulations Headline</Label>
            <Textarea
              value={confirmationPage.hero.headline || ""}
              onChange={(e) => updateHero({ headline: e.target.value })}
              placeholder="Congratulations on Taking the First Step to Securing Your Digital Assets"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Program Title</Label>
              <Input
                value={confirmationPage.hero.programTitle || ""}
                onChange={(e) => updateHero({ programTitle: e.target.value })}
                placeholder="12-Week CMMC Readiness Program"
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={confirmationPage.hero.tagline || ""}
                onChange={(e) => updateHero({ tagline: e.target.value })}
                placeholder="Fast-track to Level 1 & 2 readiness"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Core Deliverables
          </CardTitle>
          <CardDescription>
            What participants will receive from the program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicListEditor<WebinarDeliverable>
            items={confirmationPage.deliverables || []}
            onChange={(deliverables) => updateConfirmationPage({ deliverables })}
            title="Deliverables"
            addButtonText="Add Deliverable"
            emptyMessage="No deliverables added"
            createNewItem={() => ({
              id: `deliverable-${Date.now()}`,
              icon: "FileText",
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
                      placeholder="Gap Analysis (CMMC 2.0 Level 2)"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem({ description: e.target.value })}
                    placeholder="Comprehensive assessment of your current security posture"
                    rows={2}
                  />
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Benefits</CardTitle>
          <CardDescription>
            Simple bullet-point benefits with checkmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleListEditor
            items={confirmationPage.benefits || []}
            onChange={(benefits) => updateConfirmationPage({ benefits })}
            title="Benefits"
            placeholder="e.g., Weekly cohort workshops with expert instructors"
            addButtonText="Add Benefit"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Investment Card
          </CardTitle>
          <CardDescription>
            The pricing card with payment CTA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Urgency Text</Label>
            <Input
              value={confirmationPage.investmentCard.urgencyText || ""}
              onChange={(e) => updateInvestmentCard({ urgencyText: e.target.value })}
              placeholder="ONLY 15 SEATS PER COHORT — ACT NOW"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Investment Label</Label>
              <Input
                value={confirmationPage.investmentCard.investmentLabel || ""}
                onChange={(e) => updateInvestmentCard({ investmentLabel: e.target.value })}
                placeholder="Your CMMC Accelerator Investment"
              />
            </div>
            <div className="space-y-2">
              <Label>Price Display</Label>
              <Input
                value={confirmationPage.investmentCard.price || ""}
                onChange={(e) => updateInvestmentCard({ price: e.target.value })}
                placeholder="$7,500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Savings Text</Label>
            <Input
              value={confirmationPage.investmentCard.savingsText || ""}
              onChange={(e) => updateInvestmentCard({ savingsText: e.target.value })}
              placeholder="Save thousands vs. individual consulting"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Details</Label>
            <Input
              value={confirmationPage.investmentCard.paymentDetails || ""}
              onChange={(e) => updateInvestmentCard({ paymentDetails: e.target.value })}
              placeholder="One-time payment • Includes all materials"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input
                value={confirmationPage.investmentCard.ctaText || ""}
                onChange={(e) => updateInvestmentCard({ ctaText: e.target.value })}
                placeholder="Secure Your Seat Now"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Link</Label>
              <Input
                value={confirmationPage.investmentCard.ctaLink || ""}
                onChange={(e) => updateInvestmentCard({ ctaLink: e.target.value })}
                placeholder="https://paypal.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Final CTA Section
          </CardTitle>
          <CardDescription>
            The bottom call-to-action section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={confirmationPage.finalCta.headline || ""}
              onChange={(e) => updateFinalCta({ headline: e.target.value })}
              placeholder="READY TO BEGIN YOUR JOURNEY?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subheadline</Label>
              <Input
                value={confirmationPage.finalCta.subheadline || ""}
                onChange={(e) => updateFinalCta({ subheadline: e.target.value })}
                placeholder="Reserve Your Seat Today"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input
                value={confirmationPage.finalCta.ctaText || ""}
                onChange={(e) => updateFinalCta({ ctaText: e.target.value })}
                placeholder="Secure Your Seat"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={confirmationPage.finalCta.description || ""}
              onChange={(e) => updateFinalCta({ description: e.target.value })}
              placeholder="You will be enrolled in the next available cohort..."
              rows={2}
            />
          </div>

          <DynamicListEditor<WebinarTrustIndicator>
            items={confirmationPage.finalCta.trustIndicators || []}
            onChange={(trustIndicators) => updateFinalCta({ trustIndicators })}
            title="Trust Indicators"
            addButtonText="Add Trust Indicator"
            emptyMessage="No trust indicators added"
            createNewItem={() => ({
              id: `trust-${Date.now()}`,
              icon: "Shield",
              text: "",
            })}
            renderItem={(item, _index, updateItem) => (
              <div className="grid grid-cols-2 gap-3">
                <IconSelector
                  label="Icon"
                  value={item.icon}
                  onChange={(icon) => updateItem({ icon })}
                />
                <div>
                  <Label>Text</Label>
                  <Input
                    value={item.text}
                    onChange={(e) => updateItem({ text: e.target.value })}
                    placeholder="Secure Payment"
                  />
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
