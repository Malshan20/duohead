"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const completeCheckout = async () => {
      const sessionId = searchParams.get("session_id");
      const references = searchParams.getAll("reference"); // Get all 'reference' values
      const trxref = searchParams.get("trxref");
      const reference = references.length > 0 ? references[references.length - 1] : trxref; // Use last reference or trxref as fallback

      if (!sessionId && !reference) {
        toast({
          title: "Error",
          description: "Invalid session ID or reference",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("Processing payment with:", { sessionId, reference, trxref }); // Debug log

      try {
        let response;
        if (sessionId) {
          response = await fetch("/api/stripe/complete-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
        } else if (reference) {
          response = await fetch(`/api/paystack/complete-checkout?reference=${encodeURIComponent(reference)}`, {
            method: "GET",
          });
        }

        if (!response) {
          throw new Error("No response from server");
        }

        if (!response.ok) {
          let errorData = { error: "Unknown error" };
          try {
            errorData = await response.json();
          } catch (jsonError) {
            console.error("Failed to parse error response:", jsonError);
            errorData = { error: "Server error, invalid JSON response" };
          }
          throw new Error(errorData.error || "Failed to complete checkout");
        }

        const data = await response.json(); // Parse success response
        console.log("API Response:", data);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single();

          toast({
            title: "Success",
            description: `Subscription updated to ${profile?.subscription_tier} plan`,
          });
        }
      } catch (error: any) {
        console.error("Checkout error:", error); // Debug error
        toast({
          title: "Error",
          description: error.message || "Failed to complete subscription",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    completeCheckout();
  }, [searchParams]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            )}
            Subscription Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Processing your transaction...</p>
          ) : (
            <>
              <p className="text-lg">
                Your transaction has been successfully processed!
              </p>
              <p className="text-muted-foreground">
                You can now enjoy all the features of your plan. Return to settings to manage your subscription or continue exploring.
              </p>
              <Button onClick={() => router.push("/dashboard/settings")}>
                Back to Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}