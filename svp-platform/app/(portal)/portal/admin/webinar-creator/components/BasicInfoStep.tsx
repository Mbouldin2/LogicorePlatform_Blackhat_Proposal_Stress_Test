"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WebinarDoc } from "@/lib/types/webinar";
import { FileText, Link, Calendar, Users, DollarSign } from "lucide-react";

interface BasicInfoStepProps {
  webinar: Partial<WebinarDoc>;
  onChange: (updates: Partial<WebinarDoc>) => void;
}

export function BasicInfoStep({ webinar, onChange }: BasicInfoStepProps) {
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Set up the core details for your webinar or training event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Webinar/Event Title *</Label>
            <Input
              id="title"
              value={webinar.title || ""}
              onChange={(e) => {
                const title = e.target.value;
                onChange({
                  title,
                  slug: webinar.slug || generateSlug(title),
                });
              }}
              placeholder="e.g., CMMC Cybersecurity Compliance Training"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL Slug
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/webinars/</span>
              <Input
                id="slug"
                value={webinar.slug || ""}
                onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                placeholder="cmmc-training"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will be the URL path for your webinar landing page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              value={webinar.shortDescription || ""}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              placeholder="A brief description for search engines and social sharing..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {(webinar.shortDescription || "").length}/160 characters (recommended for SEO)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Event Details
          </CardTitle>
          <CardDescription>
            Optional scheduling and capacity information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Program Duration</Label>
              <Input
                id="duration"
                value={webinar.duration || ""}
                onChange={(e) => onChange({ duration: e.target.value })}
                placeholder="e.g., 12-Week Program, 2-Hour Webinar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participantLimit" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participant Limit
              </Label>
              <Input
                id="participantLimit"
                type="number"
                value={webinar.participantLimit || ""}
                onChange={(e) => onChange({ participantLimit: parseInt(e.target.value) || undefined })}
                placeholder="e.g., 15"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Pricing & Payment
          </CardTitle>
          <CardDescription>
            Set up pricing and payment options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={webinar.price || ""}
                onChange={(e) => onChange({ price: e.target.value })}
                placeholder="e.g., $7,500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentLink">Payment Link URL</Label>
              <Input
                id="paymentLink"
                value={webinar.paymentLink || ""}
                onChange={(e) => onChange({ paymentLink: e.target.value })}
                placeholder="https://paypal.com/..."
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a PayPal, Stripe, or other payment processor link for registration payments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
