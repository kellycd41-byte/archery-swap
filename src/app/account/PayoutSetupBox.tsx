"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PayoutStatus = {
  hasAccount: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

export default function PayoutSetupBox() {
  const [isStarting, setIsStarting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function getSessionToken() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("Please sign in again before setting up payouts.");
    }

    return session.access_token;
  }

  async function loadPayoutStatus() {
    setIsCheckingStatus(true);
    setErrorMessage("");

    try {
      const accessToken = await getSessionToken();

      const response = await fetch("/api/stripe/connect/status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong while checking payout status."
        );
      }

      setStatus(data as PayoutStatus);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while checking payout status.";

      setErrorMessage(message);
      setStatus(null);
    } finally {
      setIsCheckingStatus(false);
    }
  }

  async function handleStartPayoutSetup() {
    setIsStarting(true);
    setErrorMessage("");

    try {
      const accessToken = await getSessionToken();

      const response = await fetch("/api/stripe/connect/onboarding", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(
          data.error || "Something went wrong while starting payout setup."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while starting payout setup.";

      setIsStarting(false);
      setErrorMessage(message);
    }
  }

  useEffect(() => {
    loadPayoutStatus();
  }, []);

  const isReady =
    Boolean(status?.hasAccount) &&
    status?.chargesEnabled &&
    status?.payoutsEnabled &&
    status?.detailsSubmitted;

  const hasStarted = Boolean(status?.hasAccount);

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">
        Seller Payouts
      </p>

      <h3 className="mt-2 text-2xl font-black tracking-tight text-stone-950">
        {isReady
          ? "Payouts are ready."
          : hasStarted
            ? "Finish payout setup."
            : "Set up payouts to sell."}
      </h3>

      <p className="mt-3 text-sm font-bold leading-6 text-stone-700">
        {isReady
          ? "Your Stripe payout account is connected for marketplace checkout testing."
          : hasStarted
            ? "Your Stripe payout account has been started. If Stripe still needs more information, continue setup below."
            : "Before real checkout goes live, sellers will need to connect a Stripe payout account. Stripe handles the secure onboarding steps."}
      </p>

      {isCheckingStatus ? (
        <div className="mt-4 rounded-2xl border border-stone-300 bg-white p-4 text-sm font-bold text-stone-700">
          Checking payout status...
        </div>
      ) : null}

      {!isCheckingStatus && hasStarted ? (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Details
            </p>
            <p className="mt-1 font-black">
              {status?.detailsSubmitted ? "Submitted" : "Needs Info"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Charges
            </p>
            <p className="mt-1 font-black">
              {status?.chargesEnabled ? "Enabled" : "Not Ready"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Payouts
            </p>
            <p className="mt-1 font-black">
              {status?.payoutsEnabled ? "Enabled" : "Not Ready"}
            </p>
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          {errorMessage}
        </div>
      ) : null}

      {!isReady ? (
        <button
          type="button"
          onClick={handleStartPayoutSetup}
          disabled={isStarting || isCheckingStatus}
          className="mt-5 w-full cursor-pointer rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStarting
            ? "Opening Stripe..."
            : hasStarted
              ? "Continue Payout Setup"
              : "Set Up Payouts"}
        </button>
      ) : null}

      <button
        type="button"
        onClick={loadPayoutStatus}
        disabled={isCheckingStatus}
        className="mt-3 w-full cursor-pointer rounded-2xl border border-emerald-300 bg-white px-5 py-4 text-center text-sm font-black text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCheckingStatus ? "Checking..." : "Refresh Payout Status"}
      </button>

      <p className="mt-3 text-xs font-bold leading-5 text-stone-600">
        You may be sent to Stripe. After you finish, Stripe will send you back
        to your Archery Outlet account.
      </p>
    </div>
  );
}
