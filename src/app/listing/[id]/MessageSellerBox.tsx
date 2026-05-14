"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type MessageSellerBoxProps = {
  listingId: string;
  listingTitle: string;
  sellerUserId: string | null;
};

export default function MessageSellerBox({
  listingId,
  listingTitle,
  sellerUserId,
}: MessageSellerBoxProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [messageBody, setMessageBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      setUser(data.session?.user ?? null);
      setIsLoadingSession(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!user) {
      setErrorMessage("Please sign in before sending a message.");
      return;
    }

    if (!sellerUserId) {
      setErrorMessage(
        "Messaging is not available for this listing because it is not connected to a seller account yet."
      );
      return;
    }

    if (user.id === sellerUserId) {
      setErrorMessage("You cannot message yourself about your own listing.");
      return;
    }

    if (!messageBody.trim()) {
      setErrorMessage("Please write a message to the seller.");
      return;
    }

    setIsSending(true);

    const { error } = await supabase.from("messages").insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: sellerUserId,
      body: messageBody.trim(),
    });

    setIsSending(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessageBody("");
    setSuccessMessage("Your message was sent.");
  }

  return (
    <div className="mt-4 rounded-2xl border border-stone-300 bg-white p-4">
      <h3 className="text-xl font-black">Message Seller</h3>

      <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
        Ask a question about this listing before arranging payment, pickup, or
        shipping.
      </p>

      {!sellerUserId ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-black text-amber-950">
            Messaging is not available for this older listing yet.
          </p>
          <p className="mt-2 text-xs font-bold leading-5 text-amber-900">
            New listings submitted by signed-in users will support messaging.
          </p>
        </div>
      ) : isLoadingSession ? (
        <div className="mt-4 rounded-xl border border-stone-300 bg-stone-50 p-4">
          <p className="text-sm font-black text-stone-950">
            Checking sign-in status...
          </p>
        </div>
      ) : !user ? (
        <div className="mt-4 rounded-xl border border-stone-300 bg-stone-50 p-4">
          <p className="text-sm font-black text-stone-950">
            Sign in to message the seller.
          </p>

          <p className="mt-2 text-xs font-bold leading-5 text-stone-500">
            You need an Archery Outlet account before sending messages.
          </p>

          <Link
            href="/account"
            className="mt-4 inline-block rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white hover:bg-stone-800"
          >
            Sign In or Create Account
          </Link>
        </div>
      ) : user.id === sellerUserId ? (
        <div className="mt-4 rounded-xl border border-stone-300 bg-stone-50 p-4">
          <p className="text-sm font-black text-stone-950">
            This is your listing.
          </p>

          <p className="mt-2 text-xs font-bold leading-5 text-stone-500">
            Buyers will be able to message you from this area.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="mt-4 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black">Your message</span>

            <textarea
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              rows={4}
              placeholder={`Hi, I have a question about "${listingTitle}".`}
              className="rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-bold leading-6 outline-none focus:border-emerald-700"
            />
          </label>

          {successMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSending}
            className="cursor-pointer rounded-xl bg-stone-950 px-6 py-3 text-center font-black text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Sending Message..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}