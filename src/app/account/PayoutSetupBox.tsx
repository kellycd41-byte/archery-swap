"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PayoutSetupBox() {
  const [isStarting, setIsStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleStartPayoutSetup() {
    setIsStarting(true);
    setErrorMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      setIsStarting(false);
      setErrorMessage("Please sign in again before setting up payouts.");
      return;
    }

    const response = await fetch("/api/stripe/connect/onboarding", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      setIsStarting(false);
      setErrorMessage(
        data.error || "Something went wrong while starting payout setup."
      );
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">
        Seller Payouts
      </p>

      <h3 className="mt-2 text-2xl font-black tracking-tight text-stone-950">
        Set up payouts to sell.
      </h3>

      <p className="mt-3 text-sm font-bold leading-6 text-stone-700">
        Before real checkout goes live, sellers will need to connect a Stripe
        payout account. Stripe handles the secure onboarding steps.
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleStartPayoutSetup}
        disabled={isStarting}
        className="mt-5 w-full cursor-pointer rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isStarting ? "Opening Stripe..." : "Set Up Payouts"}
      </button>

      <p className="mt-3 text-xs font-bold leading-5 text-stone-600">
        You will be sent to Stripe. After you finish, Stripe will send you back
        to your Archery Outlet account.
      </p>
    </div>
  );
}
