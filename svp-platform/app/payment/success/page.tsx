"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Download, Mail } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const signatureId = searchParams.get("signatureId");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (signatureId) {
      setDownloadUrl(`/api/proposals/download-signed?id=${signatureId}`);
    }
  }, [signatureId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-[#1e3a5f]">
            Payment Setup Complete!
          </CardTitle>
          <CardDescription className="text-base">
            Your agreement has been signed and your monthly subscription is now active.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              What&apos;s Complete:
            </h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Document electronically signed by both parties</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Monthly payment method saved securely via Stripe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Subscription activated - first payment will be charged on the 1st of next month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Signed copy emailed to all parties</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {downloadUrl && (
              <Button
                asChild
                className="w-full bg-[#C8A951] hover:bg-[#b89a42] text-[#1e3a5f] font-semibold"
              >
                <Link href={downloadUrl} target="_blank">
                  <Download className="mr-2 h-4 w-4" />
                  Download Signed Agreement
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              asChild
              className="w-full"
            >
              <Link href="mailto:nel@strategicvalueplus.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Strategic Value+
              </Link>
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Questions about your subscription?
            </p>
            <p className="text-sm text-gray-500">
              Email us at{" "}
              <a href="mailto:nel@strategicvalueplus.com" className="text-[#1e3a5f] font-medium hover:underline">
                nel@strategicvalueplus.com
              </a>
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-400 text-center">
              Strategic Value+ • 8 The Green #13351, Dover, DE 19901
              <br />
              <a href="https://strategicvalueplus.com" className="hover:underline">
                strategicvalueplus.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
