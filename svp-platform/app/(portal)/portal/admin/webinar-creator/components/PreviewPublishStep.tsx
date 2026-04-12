"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import type { WebinarDoc } from "@/lib/types/webinar";
import { WebinarPreview } from "./WebinarPreview";
import { 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Globe, 
  Save, 
  Rocket, 
  Calendar,
  Copy,
  CheckCircle,
  ExternalLink,
  Loader2,
  Clock,
} from "lucide-react";

interface PreviewPublishStepProps {
  webinar: Partial<WebinarDoc>;
  onChange: (updates: Partial<WebinarDoc>) => void;
  onSave: () => Promise<void>;
  onPublish: (scheduledAt?: string) => Promise<void>;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function PreviewPublishStep({
  webinar,
  onChange,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false,
}: PreviewPublishStepProps) {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewPage, setPreviewPage] = useState<"landing" | "confirmation">("landing");
  const [copied, setCopied] = useState<string | null>(null);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  const seo = webinar.seo || {
    landingPage: { metaTitle: "", metaDescription: "" },
    confirmationPage: { metaTitle: "", metaDescription: "" },
  };

  const updateSEO = (page: "landingPage" | "confirmationPage", updates: Record<string, string>) => {
    onChange({
      seo: {
        ...seo,
        [page]: { ...seo[page], ...updates },
      },
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const landingUrl = `/webinars/${webinar.slug || "preview"}`;
  const confirmationUrl = `/webinars/${webinar.slug || "preview"}/confirmation`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Preview
          </CardTitle>
          <CardDescription>
            Preview your webinar pages before publishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={previewPage} onValueChange={(v) => setPreviewPage(v as "landing" | "confirmation")}>
              <TabsList>
                <TabsTrigger value="landing">Landing Page</TabsTrigger>
                <TabsTrigger value="confirmation">Confirmation Page</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                type="button"
                variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={previewDevice === "tablet" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPreviewDevice("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border rounded-lg bg-gray-100 p-4 min-h-[500px] flex justify-center overflow-auto">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-all"
              style={{
                width: previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "768px" : "100%",
                maxWidth: "100%",
              }}
            >
              <WebinarPreview webinar={webinar} page={previewPage} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            SEO Settings
          </CardTitle>
          <CardDescription>
            Optimize your pages for search engines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="landing-seo">
            <TabsList className="mb-4">
              <TabsTrigger value="landing-seo">Landing Page SEO</TabsTrigger>
              <TabsTrigger value="confirmation-seo">Confirmation Page SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="landing-seo" className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={seo.landingPage.metaTitle || ""}
                  onChange={(e) => updateSEO("landingPage", { metaTitle: e.target.value })}
                  placeholder={webinar.title || "Page title for search engines"}
                />
                <p className="text-xs text-muted-foreground">
                  {(seo.landingPage.metaTitle || "").length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={seo.landingPage.metaDescription || ""}
                  onChange={(e) => updateSEO("landingPage", { metaDescription: e.target.value })}
                  placeholder={webinar.shortDescription || "Description for search engines"}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {(seo.landingPage.metaDescription || "").length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={seo.landingPage.keywords || ""}
                  onChange={(e) => updateSEO("landingPage", { keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="space-y-2">
                <Label>Open Graph Image URL</Label>
                <Input
                  value={seo.landingPage.ogImage || ""}
                  onChange={(e) => updateSEO("landingPage", { ogImage: e.target.value })}
                  placeholder="/images/og-image.jpg"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Search Preview</p>
                <div className="text-blue-600 text-lg font-medium">
                  {seo.landingPage.metaTitle || webinar.title || "Page Title"}
                </div>
                <div className="text-green-700 text-sm">
                  yoursite.com{landingUrl}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {seo.landingPage.metaDescription || webinar.shortDescription || "Page description..."}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="confirmation-seo" className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={seo.confirmationPage.metaTitle || ""}
                  onChange={(e) => updateSEO("confirmationPage", { metaTitle: e.target.value })}
                  placeholder={`${webinar.title || "Webinar"} - Confirmation`}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={seo.confirmationPage.metaDescription || ""}
                  onChange={(e) => updateSEO("confirmationPage", { metaDescription: e.target.value })}
                  placeholder="Confirmation page description"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Publishing
          </CardTitle>
          <CardDescription>
            Save your work or publish your webinar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Current Status</p>
              <Badge
                variant={
                  webinar.status === "published"
                    ? "default"
                    : webinar.status === "scheduled"
                    ? "secondary"
                    : "outline"
                }
                className="mt-1"
              >
                {webinar.status || "draft"}
              </Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </div>

          {/* Schedule Publishing */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <Label>Schedule Publishing</Label>
                  <p className="text-sm text-muted-foreground">
                    Set a future date and time to publish
                  </p>
                </div>
              </div>
              <Switch
                checked={scheduleMode}
                onCheckedChange={setScheduleMode}
              />
            </div>

            {scheduleMode && (
              <div className="space-y-2">
                <Label>Publish Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}

            <div className="flex gap-2">
              {scheduleMode ? (
                <Button
                  type="button"
                  onClick={() => onPublish(scheduledDate)}
                  disabled={isPublishing || !webinar.title || !webinar.slug || !scheduledDate}
                  className="flex-1"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Publish
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => onPublish()}
                  disabled={isPublishing || !webinar.title || !webinar.slug}
                  className="flex-1"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Publish Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {webinar.status === "published" && (
            <div className="space-y-4">
              <p className="font-medium">Published URLs</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input value={landingUrl} readOnly className="flex-1 bg-gray-50" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(landingUrl, "landing")}
                  >
                    {copied === "landing" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="icon" asChild>
                    <a href={landingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input value={confirmationUrl} readOnly className="flex-1 bg-gray-50" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(confirmationUrl, "confirmation")}
                  >
                    {copied === "confirmation" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="icon" asChild>
                    <a href={confirmationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!webinar.title && (
            <p className="text-sm text-amber-600">
              ⚠️ Please add a title before publishing
            </p>
          )}
          {!webinar.slug && (
            <p className="text-sm text-amber-600">
              ⚠️ Please add a URL slug before publishing
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
