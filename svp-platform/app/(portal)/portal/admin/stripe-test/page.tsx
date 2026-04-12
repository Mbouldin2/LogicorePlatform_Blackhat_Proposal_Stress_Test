"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  TestTube,
  Zap,
  Info,
} from "lucide-react";
import { toast } from "sonner";

// ─── Payment Form (inside Elements provider) ─────────────────────────────────
function PaymentForm({
  clientSecret,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  onSuccess: (id: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Payment failed");
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      onError(`Unexpected status: ${paymentIntent?.status}`);
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#1e3a5f] hover:bg-[#152d4a]"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StripeTestPage() {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [loadingMode, setLoadingMode] = useState(true);
  const [savingMode, setSavingMode] = useState(false);

  const [amount, setAmount] = useState("10.00");
  const [description, setDescription] = useState("Test Payment");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  // Load current mode from server
  useEffect(() => {
    fetch("/api/stripe/config")
      .then((r) => r.json())
      .then((d) => {
        setMode(d.mode ?? "test");
      })
      .catch(() => {})
      .finally(() => setLoadingMode(false));
  }, []);

  // Load Stripe.js with the correct publishable key whenever mode changes
  useEffect(() => {
    const key =
      mode === "live"
        ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE
        : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST ??
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (key) {
      setStripePromise(loadStripe(key));
    } else {
      setStripePromise(null);
    }
    // Reset payment state on mode change
    setClientSecret(null);
    setPaymentIntentId(null);
    setResult(null);
  }, [mode]);

  const handleModeToggle = async (checked: boolean) => {
    const newMode = checked ? "live" : "test";
    setSavingMode(true);
    try {
      const res = await fetch("/api/stripe/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) {
        setMode(newMode);
        toast.success(`Switched to ${newMode === "live" ? "Live" : "Test"} mode`);
      } else {
        toast.error("Failed to save mode setting");
      }
    } catch {
      toast.error("Failed to save mode setting");
    } finally {
      setSavingMode(false);
    }
  };

  const createPaymentIntent = async () => {
    setCreatingIntent(true);
    setClientSecret(null);
    setResult(null);
    try {
      const cents = Math.round(parseFloat(amount) * 100);
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cents, description, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create payment intent");
        return;
      }
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      toast.success("Payment intent created");
    } catch (err) {
      toast.error("Failed to create payment intent");
    } finally {
      setCreatingIntent(false);
    }
  };

  const reset = () => {
    setClientSecret(null);
    setPaymentIntentId(null);
    setResult(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Stripe Integration Test
          </h1>
          <p className="text-muted-foreground mt-1">
            Test payment flows and verify your Stripe configuration
          </p>
        </div>
        <Badge
          className={
            mode === "live"
              ? "bg-green-100 text-green-800 border-green-300 text-sm px-3 py-1"
              : "bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1"
          }
          variant="outline"
        >
          {mode === "live" ? <Zap className="h-3 w-3 mr-1" /> : <TestTube className="h-3 w-3 mr-1" />}
          {mode === "live" ? "Live Mode" : "Test Mode"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Config + Test cards */}
        <div className="md:col-span-1 space-y-4">
          {/* Mode Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Mode</CardTitle>
              <CardDescription>Switch between test and live Stripe keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingMode ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {mode === "live" ? "Live Mode" : "Test Mode"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {mode === "live"
                        ? "Real payments will be charged"
                        : "No real charges — safe to test"}
                    </p>
                  </div>
                  <Switch
                    checked={mode === "live"}
                    onCheckedChange={handleModeToggle}
                    disabled={savingMode}
                  />
                </div>
              )}

              {mode === "live" && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 text-xs">
                    <strong>Live mode active.</strong> Real cards will be charged.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Key Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Key Status</CardTitle>
              <CardDescription>Environment variable configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <KeyStatusRow
                label="Test Publishable Key"
                configured={
                  !!(
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST ||
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  )
                }
              />
              <KeyStatusRow
                label="Live Publishable Key"
                configured={!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE}
              />
              <Separator />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                Secret keys are server-side only and cannot be shown here.
              </p>
            </CardContent>
          </Card>

          {/* Test Cards Reference */}
          {mode === "test" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Test Card Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs font-mono">
                {TEST_CARDS.map((c) => (
                  <div key={c.number} className="flex justify-between items-center">
                    <span className="text-gray-700">{c.number}</span>
                    <Badge variant="outline" className={c.badgeClass + " text-xs"}>
                      {c.label}
                    </Badge>
                  </div>
                ))}
                <p className="text-muted-foreground font-sans text-xs mt-2">
                  Use any future expiry, any 3-digit CVC, any ZIP.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Payment test */}
        <div className="md:col-span-2 space-y-4">
          {/* Create Payment Intent */}
          {!clientSecret && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create Payment Intent</CardTitle>
                <CardDescription>
                  Configure and create a test payment intent to verify your Stripe setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        min="0.50"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-7"
                        placeholder="10.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Test Payment"
                    />
                  </div>
                </div>

                <Button
                  onClick={createPaymentIntent}
                  disabled={creatingIntent || !amount}
                  className="w-full bg-[#1e3a5f] hover:bg-[#152d4a]"
                >
                  {creatingIntent ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Create Payment Intent (${parseFloat(amount || "0").toFixed(2)})
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          {clientSecret && !result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Enter Payment Details</CardTitle>
                    <CardDescription className="mt-1">
                      Intent ID:{" "}
                      <code className="text-xs bg-gray-100 px-1 rounded">{paymentIntentId}</code>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {stripePromise ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: { theme: "stripe" } }}
                  >
                    <PaymentForm
                      clientSecret={clientSecret}
                      onSuccess={(id) =>
                        setResult({ type: "success", message: `Payment succeeded! ID: ${id}` })
                      }
                      onError={(msg) => setResult({ type: "error", message: msg })}
                    />
                  </Elements>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">
                      Stripe publishable key not configured for {mode} mode.
                      Set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_{mode.toUpperCase()}</code> in your environment variables.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card className={result.type === "success" ? "border-green-200" : "border-red-200"}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {result.type === "success" ? (
                    <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${result.type === "success" ? "text-green-800" : "text-red-800"}`}>
                      {result.type === "success" ? "Payment Successful" : "Payment Failed"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={reset} className="mt-4 w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Another Test
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Webhook Info */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                Webhook Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                Register this URL in your{" "}
                <a
                  href="https://dashboard.stripe.com/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Stripe Dashboard
                </a>
                :
              </p>
              <code className="block bg-gray-100 rounded p-2 text-xs break-all">
                {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}
                /api/stripe/webhook
              </code>
              <p className="text-xs text-muted-foreground">
                Set <code>STRIPE_WEBHOOK_SECRET</code> in your environment variables after creating the webhook.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function KeyStatusRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {configured ? (
        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs" variant="outline">
          <CheckCircle className="h-3 w-3 mr-1" /> Set
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs" variant="outline">
          <XCircle className="h-3 w-3 mr-1" /> Missing
        </Badge>
      )}
    </div>
  );
}

const TEST_CARDS = [
  { number: "4242 4242 4242 4242", label: "Succeeds", badgeClass: "bg-green-100 text-green-700 border-green-200" },
  { number: "4000 0025 0000 3155", label: "3D Secure", badgeClass: "bg-blue-100 text-blue-700 border-blue-200" },
  { number: "4000 0000 0000 9995", label: "Declined", badgeClass: "bg-red-100 text-red-700 border-red-200" },
  { number: "4000 0000 0000 0002", label: "Declined", badgeClass: "bg-red-100 text-red-700 border-red-200" },
  { number: "4000 0000 0000 3220", label: "Auth Req", badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200" },
];
