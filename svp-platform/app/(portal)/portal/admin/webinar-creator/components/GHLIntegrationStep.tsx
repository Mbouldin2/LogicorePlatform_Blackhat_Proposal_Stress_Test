"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WebinarDoc, WebinarFormField } from "@/lib/types/webinar";
import { GHL_FIELD_MAPPINGS } from "@/lib/types/webinar";
import { DynamicListEditor } from "./DynamicListEditor";
import { Plug, FormInput, Tag, Key, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface GHLIntegrationStepProps {
  webinar: Partial<WebinarDoc>;
  onChange: (updates: Partial<WebinarDoc>) => void;
}

export function GHLIntegrationStep({ webinar, onChange }: GHLIntegrationStepProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [connectionMessage, setConnectionMessage] = useState("");

  const ghlIntegration = webinar.ghlIntegration || {
    enabled: false,
    tags: { primary: "", additional: [] },
  };

  const updateGHLIntegration = (updates: Partial<typeof ghlIntegration>) => {
    onChange({
      ghlIntegration: { ...ghlIntegration, ...updates },
    });
  };

  const updateRegistrationForm = (updates: Partial<NonNullable<typeof ghlIntegration.registrationForm>>) => {
    updateGHLIntegration({
      registrationForm: {
        enabled: ghlIntegration.registrationForm?.enabled || false,
        title: ghlIntegration.registrationForm?.title || "Register Now",
        fields: ghlIntegration.registrationForm?.fields || [],
        ...updates,
      },
    });
  };

  const updateTags = (updates: Partial<typeof ghlIntegration.tags>) => {
    updateGHLIntegration({
      tags: { ...ghlIntegration.tags, ...updates },
    });
  };

  const testConnection = async () => {
    if (!ghlIntegration.apiKey || !ghlIntegration.locationId) {
      setConnectionStatus("error");
      setConnectionMessage("API Key and Location ID are required");
      return;
    }

    setTestingConnection(true);
    setConnectionStatus("idle");

    try {
      const response = await fetch("/api/ghl/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: ghlIntegration.apiKey,
          locationId: ghlIntegration.locationId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.data?.success) {
        setConnectionStatus("success");
        setConnectionMessage(`Connected! Found ${result.data.calendarsFound} calendars.`);
      } else {
        setConnectionStatus("error");
        setConnectionMessage(result.error || "Connection failed");
      }
    } catch (error) {
      setConnectionStatus("error");
      setConnectionMessage("Failed to test connection");
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            GoHighLevel Integration
          </CardTitle>
          <CardDescription>
            Connect to GoHighLevel to capture leads and apply tags
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable GoHighLevel Integration</Label>
              <p className="text-sm text-muted-foreground">
                Capture registrations directly to your GHL account
              </p>
            </div>
            <Switch
              checked={ghlIntegration.enabled}
              onCheckedChange={(enabled) => updateGHLIntegration({ enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {ghlIntegration.enabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Enter your GoHighLevel API credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={ghlIntegration.apiKey || ""}
                  onChange={(e) => updateGHLIntegration({ apiKey: e.target.value })}
                  placeholder="Enter your GoHighLevel API key"
                />
                <p className="text-xs text-muted-foreground">
                  Find this in GoHighLevel → Settings → API Keys
                </p>
              </div>

              <div className="space-y-2">
                <Label>Location ID</Label>
                <Input
                  value={ghlIntegration.locationId || ""}
                  onChange={(e) => updateGHLIntegration({ locationId: e.target.value })}
                  placeholder="Enter your location ID"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>

                {connectionStatus === "success" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">{connectionMessage}</span>
                  </div>
                )}

                {connectionStatus === "error" && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">{connectionMessage}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label>Use Webhook Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Send data via webhook instead of direct API
                  </p>
                </div>
                <Switch
                  checked={ghlIntegration.webhookMode || false}
                  onCheckedChange={(webhookMode) => updateGHLIntegration({ webhookMode })}
                />
              </div>

              {ghlIntegration.webhookMode && (
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    value={ghlIntegration.webhookUrl || ""}
                    onChange={(e) => updateGHLIntegration({ webhookUrl: e.target.value })}
                    placeholder="https://hooks.gohighlevel.com/..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FormInput className="h-5 w-5 text-primary" />
                Registration Form
              </CardTitle>
              <CardDescription>
                Configure the form fields for capturing registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Registration Form</Label>
                  <p className="text-sm text-muted-foreground">
                    Show a form on the landing page
                  </p>
                </div>
                <Switch
                  checked={ghlIntegration.registrationForm?.enabled || false}
                  onCheckedChange={(enabled) => updateRegistrationForm({ enabled })}
                />
              </div>

              {ghlIntegration.registrationForm?.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Form Title</Label>
                      <Input
                        value={ghlIntegration.registrationForm?.title || ""}
                        onChange={(e) => updateRegistrationForm({ title: e.target.value })}
                        placeholder="Register Now"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Form Description</Label>
                      <Input
                        value={ghlIntegration.registrationForm?.description || ""}
                        onChange={(e) => updateRegistrationForm({ description: e.target.value })}
                        placeholder="Fill out the form to register"
                      />
                    </div>
                  </div>

                  <DynamicListEditor<WebinarFormField>
                    items={ghlIntegration.registrationForm?.fields || []}
                    onChange={(fields) => updateRegistrationForm({ fields })}
                    title="Form Fields"
                    addButtonText="Add Field"
                    emptyMessage="No fields added. Add fields to capture registration data."
                    createNewItem={() => ({
                      id: `field-${Date.now()}`,
                      label: "",
                      type: "text" as const,
                      placeholder: "",
                      required: false,
                      ghlFieldMapping: "firstName",
                    })}
                    renderItem={(item, _index, updateItem) => (
                      <div className="grid gap-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Field Label</Label>
                            <Input
                              value={item.label}
                              onChange={(e) => updateItem({ label: e.target.value })}
                              placeholder="First Name"
                            />
                          </div>
                          <div>
                            <Label>Field Type</Label>
                            <Select
                              value={item.type}
                              onValueChange={(value) => updateItem({ type: value as WebinarFormField["type"] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="textarea">Text Area</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>GHL Field Mapping</Label>
                            <Select
                              value={item.ghlFieldMapping}
                              onValueChange={(value) => updateItem({ ghlFieldMapping: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {GHL_FIELD_MAPPINGS.map((mapping) => (
                                  <SelectItem key={mapping.value} value={mapping.value}>
                                    {mapping.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Placeholder</Label>
                            <Input
                              value={item.placeholder || ""}
                              onChange={(e) => updateItem({ placeholder: e.target.value })}
                              placeholder="Enter placeholder text..."
                            />
                          </div>
                          <div className="flex items-end gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.required}
                                onCheckedChange={(required) => updateItem({ required })}
                              />
                              <Label>Required</Label>
                            </div>
                          </div>
                        </div>
                        {item.type === "select" && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input
                              value={item.options?.join(", ") || ""}
                              onChange={(e) =>
                                updateItem({
                                  options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Tag Configuration
              </CardTitle>
              <CardDescription>
                Tags to apply to contacts in GoHighLevel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Tag *</Label>
                <Input
                  value={ghlIntegration.tags.primary || ""}
                  onChange={(e) => updateTags({ primary: e.target.value })}
                  placeholder="e.g., cmmc-webinar-2025"
                />
                <p className="text-xs text-muted-foreground">
                  This tag will be applied to all registrants
                </p>
              </div>

              <div className="space-y-2">
                <Label>Additional Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(ghlIntegration.tags.additional || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          updateTags({
                            additional: ghlIntegration.tags.additional?.filter((_, i) => i !== index),
                          })
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="new-tag"
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !ghlIntegration.tags.additional?.includes(value)) {
                          updateTags({
                            additional: [...(ghlIntegration.tags.additional || []), value],
                          });
                          input.value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById("new-tag") as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !ghlIntegration.tags.additional?.includes(value)) {
                        updateTags({
                          additional: [...(ghlIntegration.tags.additional || []), value],
                        });
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tag Description (for admin reference)</Label>
                <Textarea
                  value={ghlIntegration.tags.description || ""}
                  onChange={(e) => updateTags({ description: e.target.value })}
                  placeholder="Notes about what these tags are used for..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
