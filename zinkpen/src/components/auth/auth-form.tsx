"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    // Demo mode — no Supabase configured. Go straight to the workspace.
    if (!supabase) {
      toast.success(mode === "signup" ? "Welcome to ZinkPen!" : "Signed in (demo mode)");
      setTimeout(() => router.push("/dashboard"), 500);
      return;
    }

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
        {mode === "signup"
          ? "Start writing, humanizing, and designing in minutes."
          : "Sign in to your ZinkPen workspace."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Rivera" required />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
        {mode === "signup" ? (
          <>Already have an account? <Link href="/login" className="font-medium text-[var(--color-ink-600)] hover:underline">Sign in</Link></>
        ) : (
          <>New to ZinkPen? <Link href="/signup" className="font-medium text-[var(--color-ink-600)] hover:underline">Create an account</Link></>
        )}
      </p>
      <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-muted)] p-3 text-center text-xs text-[var(--color-muted-foreground)]">
        Tip: ZinkPen runs in <span className="font-medium">demo mode</span> with no setup — just continue to explore the full app.
      </p>
    </div>
  );
}
