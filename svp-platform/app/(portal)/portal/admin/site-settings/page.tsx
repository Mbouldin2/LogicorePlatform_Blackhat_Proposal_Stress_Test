"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Clock,
  Share2,
  Search,
  FileText,
  Palette,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { SiteSettingsDoc } from "@/lib/schema";

type SettingsData = Omit<SiteSettingsDoc, "id" | "createdAt" | "updatedAt">;

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/site-settings");
      const data = await res.json();
      if (data.success) {
        const { id, createdAt, updatedAt, ...rest } = data.data;
        setSettings(rest as SettingsData);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved successfully");
        setHasChanges(false);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      const res = await fetch("/api/admin/site-settings", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings reset to defaults");
        fetchSettings();
        setHasChanges(false);
      }
    } catch (error) {
      toast.error("Failed to reset settings");
    }
  };

  const updateField = <K extends keyof SettingsData>(
    section: K,
    field: keyof SettingsData[K],
    value: unknown
  ) => {
    if (!settings) return;
    const sectionData = settings[section];
    if (typeof sectionData !== "object" || sectionData === null) return;
    setSettings({
      ...settings,
      [section]: {
        ...(sectionData as object),
        [field]: value,
      },
    });
    setHasChanges(true);
  };

  const updateArrayField = (
    section: keyof SettingsData,
    field: string,
    index: number,
    value: string
  ) => {
    if (!settings) return;
    const sectionData = settings[section];
    if (typeof sectionData !== "object" || sectionData === null) return;
    const arr = [...((sectionData as Record<string, unknown>)[field] as string[])];
    arr[index] = value;
    setSettings({
      ...settings,
      [section]: {
        ...(sectionData as object),
        [field]: arr,
      },
    });
    setHasChanges(true);
  };

  const addArrayItem = (section: keyof SettingsData, field: string) => {
    if (!settings) return;
    const sectionData = settings[section];
    if (typeof sectionData !== "object" || sectionData === null) return;
    const arr = [...((sectionData as Record<string, unknown>)[field] as string[]), ""];
    setSettings({
      ...settings,
      [section]: {
        ...(sectionData as object),
        [field]: arr,
      },
    });
    setHasChanges(true);
  };

  const removeArrayItem = (section: keyof SettingsData, field: string, index: number) => {
    if (!settings) return;
    const sectionData = settings[section];
    if (typeof sectionData !== "object" || sectionData === null) return;
    const arr = ((sectionData as Record<string, unknown>)[field] as string[]).filter((_, i) => i !== index);
    setSettings({
      ...settings,
      [section]: {
        ...(sectionData as object),
        [field]: arr,
      },
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container py-6">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Manage centralized configuration for the entire platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Unsaved Changes
            </Badge>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to Default Settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all settings to their default values. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={saveSettings} disabled={saving || !hasChanges}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Website</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="forms" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Forms</span>
          </TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company identity and branding information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name (Short)</Label>
                  <Input
                    value={settings.company.name}
                    onChange={(e) => updateField("company", "name", e.target.value)}
                    placeholder="Strategic Value+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name (Full)</Label>
                  <Input
                    value={settings.company.fullName}
                    onChange={(e) => updateField("company", "fullName", e.target.value)}
                    placeholder="Strategic Value+ Solutions"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alternate Name</Label>
                  <Input
                    value={settings.company.alternateName}
                    onChange={(e) => updateField("company", "alternateName", e.target.value)}
                    placeholder="Strategic Value Plus"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={settings.company.tagline}
                    onChange={(e) => updateField("company", "tagline", e.target.value)}
                    placeholder="Transforming U.S. Manufacturing"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Company Description</Label>
                <Textarea
                  value={settings.company.description}
                  onChange={(e) => updateField("company", "description", e.target.value)}
                  rows={3}
                />
              </div>
              <Separator />
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Founding Date</Label>
                  <Input
                    value={settings.company.foundingDate}
                    onChange={(e) => updateField("company", "foundingDate", e.target.value)}
                    placeholder="2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Founder Name</Label>
                  <Input
                    value={settings.company.founderName}
                    onChange={(e) => updateField("company", "founderName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Founder Title</Label>
                  <Input
                    value={settings.company.founderTitle}
                    onChange={(e) => updateField("company", "founderTitle", e.target.value)}
                    placeholder="CEO"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding Assets</CardTitle>
              <CardDescription>Logo and visual identity settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo Path</Label>
                  <Input
                    value={settings.branding.logoPath}
                    onChange={(e) => updateField("branding", "logoPath", e.target.value)}
                    placeholder="/VPlus_logo.webp"
                  />
                  <p className="text-xs text-muted-foreground">Path to logo in public folder</p>
                </div>
                <div className="space-y-2">
                  <Label>Logo Alt Text</Label>
                  <Input
                    value={settings.branding.logoAltText}
                    onChange={(e) => updateField("branding", "logoAltText", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo URL (SEO)</Label>
                  <Input
                    value={settings.branding.logoUrlSeo}
                    onChange={(e) => updateField("branding", "logoUrlSeo", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">Full URL for schema.org</p>
                </div>
                <div className="space-y-2">
                  <Label>Favicon Path</Label>
                  <Input
                    value={settings.branding.faviconPath || ""}
                    onChange={(e) => updateField("branding", "faviconPath", e.target.value)}
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>
              {settings.branding.logoPath && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <Label className="mb-2 block">Logo Preview</Label>
                  <img
                    src={settings.branding.logoPath}
                    alt={settings.branding.logoAltText}
                    className="h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Email addresses, phone numbers, and location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Email</Label>
                  <Input
                    type="email"
                    value={settings.contact.primaryEmail}
                    onChange={(e) => updateField("contact", "primaryEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notification Email</Label>
                  <Input
                    type="email"
                    value={settings.contact.notificationEmail}
                    onChange={(e) => updateField("contact", "notificationEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>No-Reply Email</Label>
                  <Input
                    type="email"
                    value={settings.contact.noReplyEmail}
                    onChange={(e) => updateField("contact", "noReplyEmail", e.target.value)}
                  />
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Main Phone (Display)</Label>
                  <Input
                    value={settings.contact.mainPhone}
                    onChange={(e) => updateField("contact", "mainPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Main Phone (Tel Link)</Label>
                  <Input
                    value={settings.contact.mainPhoneTel}
                    onChange={(e) => updateField("contact", "mainPhoneTel", e.target.value)}
                    placeholder="+1-555-123-4567"
                  />
                </div>
              </div>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={settings.contact.country}
                    onChange={(e) => updateField("contact", "country", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country Code</Label>
                  <Input
                    value={settings.contact.countryCode}
                    onChange={(e) => updateField("contact", "countryCode", e.target.value)}
                    placeholder="US"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Geo Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings.contact.geoLatitude || ""}
                    onChange={(e) => updateField("contact", "geoLatitude", parseFloat(e.target.value) || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Geo Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={settings.contact.geoLongitude || ""}
                    onChange={(e) => updateField("contact", "geoLongitude", parseFloat(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Operating hours and timezone settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Display Text</Label>
                <Input
                  value={settings.businessHours.displayText}
                  onChange={(e) => updateField("businessHours", "displayText", e.target.value)}
                  placeholder="Mon-Fri: 8am - 6pm EST"
                />
                <p className="text-xs text-muted-foreground">Shown on contact page and footer</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    value={settings.businessHours.openTime}
                    onChange={(e) => updateField("businessHours", "openTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    value={settings.businessHours.closeTime}
                    onChange={(e) => updateField("businessHours", "closeTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input
                    value={settings.businessHours.timezone}
                    onChange={(e) => updateField("businessHours", "timezone", e.target.value)}
                    placeholder="America/New_York"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Days Open</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.businessHours.daysOpen.map((day, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {day}
                      <button
                        onClick={() => removeArrayItem("businessHours", "daysOpen", index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("businessHours", "daysOpen")}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Day
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Social media profile URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={settings.social.linkedinUrl}
                    onChange={(e) => updateField("social", "linkedinUrl", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn Company URL</Label>
                  <Input
                    value={settings.social.linkedinCompanyUrl}
                    onChange={(e) => updateField("social", "linkedinCompanyUrl", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Twitter/X URL</Label>
                  <Input
                    value={settings.social.twitterUrl}
                    onChange={(e) => updateField("social", "twitterUrl", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter Handle</Label>
                  <Input
                    value={settings.social.twitterHandle}
                    onChange={(e) => updateField("social", "twitterHandle", e.target.value)}
                    placeholder="strategicvalueplus"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={settings.social.youtubeUrl}
                    onChange={(e) => updateField("social", "youtubeUrl", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube Channel</Label>
                  <Input
                    value={settings.social.youtubeChannel}
                    onChange={(e) => updateField("social", "youtubeChannel", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook URL (Optional)</Label>
                  <Input
                    value={settings.social.facebookUrl || ""}
                    onChange={(e) => updateField("social", "facebookUrl", e.target.value || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL (Optional)</Label>
                  <Input
                    value={settings.social.instagramUrl || ""}
                    onChange={(e) => updateField("social", "instagramUrl", e.target.value || undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Website Tab */}
        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle>Website URLs</CardTitle>
              <CardDescription>Main domain and website configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Main Domain</Label>
                <Input
                  value={settings.website.mainDomain}
                  onChange={(e) => updateField("website", "mainDomain", e.target.value)}
                  placeholder="https://strategicvalueplus.com"
                />
                <p className="text-xs text-muted-foreground">Used in SEO schema and canonical URLs</p>
              </div>
              <div className="space-y-2">
                <Label>Search URL (Optional)</Label>
                <Input
                  value={settings.website.searchUrl || ""}
                  onChange={(e) => updateField("website", "searchUrl", e.target.value || undefined)}
                  placeholder="https://example.com/search?q={search_term_string}"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization and schema.org data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <Input
                    value={settings.seo.priceRange}
                    onChange={(e) => updateField("seo", "priceRange", e.target.value)}
                    placeholder="$$$$"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aggregate Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={settings.seo.aggregateRating}
                    onChange={(e) => updateField("seo", "aggregateRating", parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review Count</Label>
                  <Input
                    type="number"
                    value={settings.seo.reviewCount}
                    onChange={(e) => updateField("seo", "reviewCount", parseInt(e.target.value))}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Expertise Areas (knowsAbout)</Label>
                <div className="space-y-2">
                  {settings.seo.expertiseAreas.map((area, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={area}
                        onChange={(e) => updateArrayField("seo", "expertiseAreas", index, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("seo", "expertiseAreas", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("seo", "expertiseAreas")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expertise Area
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
              <CardDescription>Contact form options and messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Response Time Commitment</Label>
                <Input
                  value={settings.forms.responseTimeCommitment}
                  onChange={(e) => updateField("forms", "responseTimeCommitment", e.target.value)}
                  placeholder="within 24 hours"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Service Options</Label>
                <div className="space-y-2">
                  {settings.forms.serviceOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateArrayField("forms", "serviceOptions", index, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("forms", "serviceOptions", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("forms", "serviceOptions")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service Option
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Company Size Options</Label>
                <div className="space-y-2">
                  {settings.forms.companySizeOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateArrayField("forms", "companySizeOptions", index, e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("forms", "companySizeOptions", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("forms", "companySizeOptions")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size Option
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>CTA Button Text</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Primary Button</Label>
                    <Input
                      value={settings.cta.primaryButtonText}
                      onChange={(e) => updateField("cta", "primaryButtonText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Secondary Button</Label>
                    <Input
                      value={settings.cta.secondaryButtonText}
                      onChange={(e) => updateField("cta", "secondaryButtonText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Assessment Button</Label>
                    <Input
                      value={settings.cta.assessmentButtonText}
                      onChange={(e) => updateField("cta", "assessmentButtonText", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Save Button for mobile */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 lg:hidden">
          <Button size="lg" onClick={saveSettings} disabled={saving} className="shadow-lg">
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
