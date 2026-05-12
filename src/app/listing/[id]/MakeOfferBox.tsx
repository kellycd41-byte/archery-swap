"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MakeOfferBoxProps = {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  sellerUserId: string | null;
};

export default function MakeOfferBox({
  listingId,
  listingTitle,
  listingPrice,
  sellerUserId,
}: MakeOfferBoxProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">(
    "info"
  );

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setCurrentUserId(user?.id || null);
      setLoadingUser(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
      setLoadingUser(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatusMessage("");
    setStatusType("info");

    if (!currentUserId) {
      setStatusType("error");
      setStatusMessage("Please sign in before making an offer.");
      return;
    }

    if (!sellerUserId) {
      setStatusType("error");
      setStatusMessage("Offers are not available for this older listing yet.");
      return;
    }

    if (currentUserId === sellerUserId) {
      setStatusType("error");
      setStatusMessage("You cannot make an offer on your own listing.");
      return;
    }

    const offerAmount = Number(amount);

    if (!amount || Number.isNaN(offerAmount) || offerAmount <= 0) {
      setStatusType("error");
      setStatusMessage("Please enter a valid offer amount.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("offers").insert({
      listing_id: listingId,
      buyer_id: currentUserId,
      seller_id: sellerUserId,
      amount: offerAmount,
      message: message.trim() || null,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      setStatusType("error");
      setStatusMessage(`Could not send offer: ${error.message}`);
      return;
    }

    setAmount("");
    setMessage("");
    setStatusType("success");
    setStatusMessage("Offer sent. You can review it from your account later.");
  }

  if (loadingUser) {
    return (
      <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-5">
        <h3 className="font-black">Make an offer</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Checking your sign-in status...
        </p>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-5">
        <h3 className="font-black">Make an offer</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Sign in to make an offer on this listing.
        </p>
        <a
          href="/account"
          className="mt-4 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-black text-white hover:bg-stone-800"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (!sellerUserId) {
    return (
      <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-5">
        <h3 className="font-black">Make an offer</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Offers are not available for this older listing yet.
        </p>
      </div>
    );
  }

  if (currentUserId === sellerUserId) {
    return (
      <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-5">
        <h3 className="font-black">Make an offer</h3>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          This is your listing, so buyers will see the offer form here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <h3 className="font-black text-emerald-950">Make an offer</h3>

      <p className="mt-2 text-sm leading-6 text-emerald-900">
        Send the seller an offer for {listingTitle}. Asking price:{" "}
        <span className="font-black">
          ${Number(listingPrice).toLocaleString()}
        </span>
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="offer-amount"
            className="text-sm font-black text-emerald-950"
          >
            Offer amount
          </label>

          <div className="mt-2 flex items-center rounded-2xl border border-emerald-300 bg-white px-4">
            <span className="font-black text-stone-500">$</span>
            <input
              id="offer-amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full bg-transparent px-2 py-3 font-bold outline-none"
              placeholder="Enter amount"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="offer-message"
            className="text-sm font-black text-emerald-950"
          >
            Message to seller, optional
          </label>

          <textarea
            id="offer-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-emerald-300 bg-white px-4 py-3 text-sm font-bold outline-none"
            placeholder="Add a short note with your offer..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {submitting ? "Sending Offer..." : "Send Offer"}
        </button>
      </form>

      {statusMessage ? (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${
            statusType === "success"
              ? "bg-emerald-100 text-emerald-950"
              : statusType === "error"
                ? "bg-red-100 text-red-900"
                : "bg-stone-100 text-stone-700"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
