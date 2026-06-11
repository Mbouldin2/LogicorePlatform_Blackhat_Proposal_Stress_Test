"use client";
import { useState } from "react";
import { toast } from "sonner";
import { User, Bell, Cpu, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [name, setName] = useState("Demo Operator");
  const [email] = useState("demo@zinkpen.ai");
  const [model, setModel] = useState("auto");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, AI preferences, notifications, and security." />
      <div className="grid max-w-4xl gap-6 p-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="size-4" /> Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="n">Full name</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="e">Email</Label><Input id="e" value={email} disabled /></div>
            <div className="sm:col-span-2"><Button onClick={() => toast.success("Profile saved")}>Save changes</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="size-4" /> AI preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Default model routing</Label>
              <Select
                value={model}
                onValueChange={setModel}
                options={[
                  { value: "auto", label: "Auto — best model per task (recommended)" },
                  { value: "anthropic", label: "Anthropic (Claude)" },
                  { value: "openai", label: "OpenAI (GPT)" },
                  { value: "gemini", label: "Google Gemini" },
                ]}
              />
              <p className="text-xs text-[var(--color-muted-foreground)]">
                ZinkPen routes across providers and falls back gracefully. Configure keys in your environment to go live.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
              <div>
                <p className="text-sm font-medium">Provider status</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">Live keys detected in environment</p>
              </div>
              <Badge variant="muted">Demo mode</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="size-4" /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Row label="Email notifications" desc="Document shares, comments, and mentions" checked={notifEmail} onChange={setNotifEmail} />
            <Row label="Product updates" desc="New features and tips" checked={notifProduct} onChange={setNotifProduct} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="size-4" /> Security</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.success("Password reset email sent")}>Change password</Button>
            <Button variant="outline" onClick={() => toast.success("2FA setup started")}>Enable 2FA</Button>
            <Button variant="danger" onClick={() => toast.error("Contact support to delete your account")}>Delete account</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
