"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type BuyNowBoxProps = {
  listingId: string;
  listingTitle: string;
  listingCategory: string | null;
};

const bowLawNoticeCategories = [
  "Compound Bows",
  "Competition Bows",
  "Recurve Bows",
  "Traditional Bows",
  "Crossbows",
];

const bowLawNoticeMessage =
  "Before continuing, you confirm that you are responsible for checking and following all applicable local, state, and federal laws related to buying, selling, shipping, transferring, owning, or using bows and crossbows.\n\nDo you want to continue?";

function needsBowLawNotice(categoryName: string | null | undefined) {
  return bowLawNoticeCategories.includes(categoryName || "");
}

export default function BuyNowBox({
  listingId,
  listingTitle,
  listingCategory,
}: BuyNowBoxProps) {
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [message, setMessage] = useState("");

  async function handleBuyNow() {
    if (
      needsBowLawNotice(listingCategory) &&
      !window.confirm(bowLawNoticeMessage)
    ) {
      return;
    }

    setIsStartingCheckout(true);
    setMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setMessage("Please sign in before buying this item.");
        setIsStartingCheckout(false);
        return;
      }

      const response = await fetch("/api/checkout/buy-now", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          listingId,
        }),
      });

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.url) {
        setMessage(result.error || "Checkout could not be started.");
        setIsStartingCheckout(false);
        return;
      }

      window.location.href = result.url;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while starting checkout.";

      setMessage(errorMessage);
      setIsStartingCheckout(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
            Secure checkout
          </p>

          <h3 className="mt-2 text-xl font-black">Buy Now</h3>
        </div>

        <span className="rounded-full bg-emerald-200 px-3 py-1 text-xs font-black text-emerald-950">
          Stripe Secure Checkout
        </span>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-stone-700">
        Start secure checkout for {listingTitle}. Your payment will be processed
        through Stripe.
      </p>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isStartingCheckout}
        className="mt-4 w-full cursor-pointer rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {isStartingCheckout ? "Starting Checkout..." : "Buy Now"}
      </button>

      {message ? (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">
          {message}
        </p>
      ) : null}

      <p className="mt-3 text-xs font-bold leading-5 text-stone-600">
        Your payment is processed securely through Stripe. Seller payout stays
        held until shipment is reviewed.
      </p>
    </div>
  );
}