"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type UserListing = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  denial_reason: string | null;
  created_at: string;
};

type OfferListing = {
  id: string;
  title: string;
  price: number;
  status: string;
};

type UserOffer = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  message: string | null;
  status: string;
  created_at: string;
  listing: OfferListing | OfferListing[] | null;
};

function formatListingDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently submitted";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatOfferDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently sent";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  if (status === "active") {
    return "Approved";
  }

  if (status === "pending") {
    return "Pending Review";
  }

  if (status === "denied") {
    return "Denied";
  }

  if (status === "inactive") {
    return "Inactive";
  }

  if (status === "sold") {
    return "Sold";
  }

  return status || "Unknown";
}

function offerStatusLabel(status: string) {
  if (status === "pending") {
    return "Pending";
  }

  if (status === "accepted") {
    return "Accepted";
  }

  if (status === "declined") {
    return "Declined";
  }

  if (status === "withdrawn") {
    return "Withdrawn";
  }

  return status || "Unknown";
}

function statusClassName(status: string) {
  if (status === "active") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "pending") {
    return "bg-amber-100 text-amber-900";
  }

  if (status === "denied") {
    return "bg-red-100 text-red-900";
  }

  if (status === "sold") {
    return "bg-stone-950 text-white";
  }

  return "bg-stone-200 text-stone-800";
}

function offerStatusClassName(status: string) {
  if (status === "pending") {
    return "bg-amber-100 text-amber-900";
  }

  if (status === "accepted") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "declined") {
    return "bg-red-100 text-red-900";
  }

  return "bg-stone-200 text-stone-800";
}

function getOfferListing(offer: UserOffer) {
  if (Array.isArray(offer.listing)) {
    return offer.listing[0] || null;
  }

  return offer.listing;
}

export default function AccountPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [myListings, setMyListings] = useState<UserListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listingsErrorMessage, setListingsErrorMessage] = useState("");
  const [listingActionMessage, setListingActionMessage] = useState("");
  const [listingActionErrorMessage, setListingActionErrorMessage] = useState("");
  const [updatingListingId, setUpdatingListingId] = useState<string | null>(
    null
  );

  const [sentOffers, setSentOffers] = useState<UserOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<UserOffer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [offersErrorMessage, setOffersErrorMessage] = useState("");
  const [offerActionMessage, setOfferActionMessage] = useState("");
  const [offerActionErrorMessage, setOfferActionErrorMessage] = useState("");
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const hasPendingReceivedOffers = receivedOffers.some(
    (offer) => offer.status === "pending"
  );

  async function loadMyListings(currentUser: User) {
    setIsLoadingListings(true);
    setListingsErrorMessage("");

    const { data, error } = await supabase
      .from("listings")
      .select("id,title,price,category,condition,status,denial_reason,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    setIsLoadingListings(false);

    if (error) {
      setListingsErrorMessage(error.message);
      setMyListings([]);
      return;
    }

    setMyListings((data || []) as UserListing[]);
  }

  async function loadMyOffers(currentUser: User) {
    setIsLoadingOffers(true);
    setOffersErrorMessage("");

    const { data: sentData, error: sentError } = await supabase
      .from("offers")
      .select(
        "id,listing_id,buyer_id,seller_id,amount,message,status,created_at,listing:listings(id,title,price,status)"
      )
      .eq("buyer_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (sentError) {
      setOffersErrorMessage(sentError.message);
      setSentOffers([]);
      setReceivedOffers([]);
      setIsLoadingOffers(false);
      return;
    }

    const { data: receivedData, error: receivedError } = await supabase
      .from("offers")
      .select(
        "id,listing_id,buyer_id,seller_id,amount,message,status,created_at,listing:listings(id,title,price,status)"
      )
      .eq("seller_id", currentUser.id)
      .order("created_at", { ascending: false });

    setIsLoadingOffers(false);

    if (receivedError) {
      setOffersErrorMessage(receivedError.message);
      setSentOffers((sentData || []) as UserOffer[]);
      setReceivedOffers([]);
      return;
    }

    setSentOffers((sentData || []) as UserOffer[]);
    setReceivedOffers((receivedData || []) as UserOffer[]);
  }

  async function refreshAccountData(currentUser: User) {
    await Promise.all([loadMyListings(currentUser), loadMyOffers(currentUser)]);
  }

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const signedInUser = data.session?.user ?? null;

      setUser(signedInUser);
      setIsLoadingSession(false);

      if (signedInUser) {
        refreshAccountData(signedInUser);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const signedInUser = session?.user ?? null;

      setUser(signedInUser);

      if (signedInUser) {
        refreshAccountData(signedInUser);
      } else {
        setMyListings([]);
        setSentOffers([]);
        setReceivedOffers([]);
        setListingsErrorMessage("");
        setOffersErrorMessage("");
        setOfferActionMessage("");
        setOfferActionErrorMessage("");
        setListingActionMessage("");
        setListingActionErrorMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    const cleanedEmail = email.trim();

    if (!cleanedEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (!cleanedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email: cleanedEmail,
        password,
      });

      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.user && !data.session) {
        setMessage(
          "Account created. Please check your email to confirm your account, then come back and sign in."
        );
      } else {
        setMessage("Account created and signed in.");
        setUser(data.user);

        if (data.user) {
          refreshAccountData(data.user);
        }
      }

      setPassword("");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setUser(data.user);
    setMessage("You are signed in.");
    setPassword("");

    if (data.user) {
      refreshAccountData(data.user);
    }
  }

  async function handleSignOut() {
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signOut();

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setUser(null);
    setEmail("");
    setPassword("");
    setMyListings([]);
    setSentOffers([]);
    setReceivedOffers([]);
    setListingsErrorMessage("");
    setOffersErrorMessage("");
    setOfferActionMessage("");
    setOfferActionErrorMessage("");
    setListingActionMessage("");
    setListingActionErrorMessage("");
    setMessage("You are signed out.");
  }

  async function handleMarkInactive(listing: UserListing) {
    if (!user) {
      setListingActionErrorMessage(
        "Please sign in again before updating this listing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Mark "${listing.title}" as inactive? This will hide it from Browse, but you can reactivate it later.`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingListingId(listing.id);
    setListingActionMessage("");
    setListingActionErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status: "inactive" })
      .eq("id", listing.id)
      .eq("user_id", user.id);

    setUpdatingListingId(null);

    if (error) {
      setListingActionErrorMessage(error.message);
      return;
    }

    setListingActionMessage(
      `"${listing.title}" has been marked inactive and is now hidden from Browse.`
    );

    await loadMyListings(user);
  }

  async function handleReactivateListing(listing: UserListing) {
    if (!user) {
      setListingActionErrorMessage(
        "Please sign in again before updating this listing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Reactivate "${listing.title}"? This will make it visible in Browse again.`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingListingId(listing.id);
    setListingActionMessage("");
    setListingActionErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status: "active" })
      .eq("id", listing.id)
      .eq("user_id", user.id);

    setUpdatingListingId(null);

    if (error) {
      setListingActionErrorMessage(error.message);
      return;
    }

    setListingActionMessage(
      `"${listing.title}" has been reactivated and is visible in Browse again.`
    );

    await loadMyListings(user);
  }

  async function updateOfferStatus(offer: UserOffer, nextStatus: string) {
    if (!user) {
      setOfferActionErrorMessage("Please sign in again before updating this offer.");
      return;
    }

    if (offer.status !== "pending") {
      setOfferActionErrorMessage("Only pending offers can be updated.");
      return;
    }

    const listing = getOfferListing(offer);
    const listingTitle = listing?.title || "this listing";

    let confirmMessage = "";

    if (nextStatus === "accepted") {
      confirmMessage = `Accept the offer of $${Number(
        offer.amount
      ).toLocaleString()} for "${listingTitle}"? This will mark the listing sold and hide it from Browse.`;
    } else if (nextStatus === "declined") {
      confirmMessage = `Decline the offer of $${Number(
        offer.amount
      ).toLocaleString()} for "${listingTitle}"?`;
    } else {
      confirmMessage = `Withdraw your offer of $${Number(
        offer.amount
      ).toLocaleString()} for "${listingTitle}"?`;
    }

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    setUpdatingOfferId(offer.id);
    setOfferActionMessage("");
    setOfferActionErrorMessage("");

    let query = supabase
      .from("offers")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offer.id)
      .eq("status", "pending");

    if (nextStatus === "withdrawn") {
      query = query.eq("buyer_id", user.id);
    } else {
      query = query.eq("seller_id", user.id);
    }

    const { error } = await query;

    if (error) {
      setUpdatingOfferId(null);
      setOfferActionErrorMessage(error.message);
      return;
    }

    if (nextStatus === "accepted") {
      const { error: listingError } = await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", offer.listing_id)
        .eq("user_id", user.id);

      if (listingError) {
        setUpdatingOfferId(null);
        setOfferActionErrorMessage(
          `Offer was accepted, but the listing could not be marked sold: ${listingError.message}`
        );
        await loadMyOffers(user);
        return;
      }

      const { error: otherOffersError } = await supabase
        .from("offers")
        .update({
          status: "declined",
          updated_at: new Date().toISOString(),
        })
        .eq("listing_id", offer.listing_id)
        .eq("seller_id", user.id)
        .eq("status", "pending")
        .neq("id", offer.id);

      if (otherOffersError) {
        setUpdatingOfferId(null);
        setOfferActionErrorMessage(
          `Offer was accepted and the listing was marked sold, but other offers could not be declined: ${otherOffersError.message}`
        );
        await refreshAccountData(user);
        return;
      }

      setUpdatingOfferId(null);
      setOfferActionMessage(
        `Offer accepted for "${listingTitle}". The listing was marked sold and other pending offers were declined.`
      );

      await refreshAccountData(user);
      return;
    }

    setUpdatingOfferId(null);

    if (nextStatus === "declined") {
      setOfferActionMessage(`Offer declined for "${listingTitle}".`);
    } else {
      setOfferActionMessage(`Offer withdrawn for "${listingTitle}".`);
    }

    await loadMyOffers(user);
  }

  async function handleAcceptOffer(offer: UserOffer) {
    await updateOfferStatus(offer, "accepted");
  }

  async function handleDeclineOffer(offer: UserOffer) {
    await updateOfferStatus(offer, "declined");
  }

  async function handleWithdrawOffer(offer: UserOffer) {
    await updateOfferStatus(offer, "withdrawn");
  }

  function renderOfferCard(offer: UserOffer, kind: "sent" | "received") {
    const listing = getOfferListing(offer);
    const listingTitle = listing?.title || "Listing unavailable";
    const listingStatus = listing?.status || "";

    return (
      <div
        key={offer.id}
        className="rounded-2xl border border-stone-300 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-black">{listingTitle}</h4>

            <p className="mt-1 text-sm font-bold text-stone-500">
              {kind === "sent" ? "Sent" : "Received"}{" "}
              {formatOfferDate(offer.created_at)}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${offerStatusClassName(
              offer.status
            )}`}
          >
            {offerStatusLabel(offer.status)}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-stone-100 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Offer
            </p>
            <p className="mt-1 font-black">
              ${Number(offer.amount).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-stone-100 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Listing Price
            </p>
            <p className="mt-1 font-black">
              {listing
                ? `$${Number(listing.price).toLocaleString()}`
                : "Unavailable"}
            </p>
          </div>

          <div className="rounded-xl bg-stone-100 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Listing Status
            </p>
            <p className="mt-1 font-black">
              {listingStatus ? statusLabel(listingStatus) : "Unavailable"}
            </p>
          </div>
        </div>

        {offer.message ? (
          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Message
            </p>
            <p className="mt-2 whitespace-pre-line text-sm font-bold leading-6 text-stone-700">
              {offer.message}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          {listing ? (
            <Link
              href={`/listing/${offer.listing_id}`}
              className="inline-block rounded-xl bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-stone-800"
            >
              View Listing
            </Link>
          ) : null}

          {kind === "received" && offer.status === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => handleAcceptOffer(offer)}
                disabled={updatingOfferId === offer.id}
                className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingOfferId === offer.id ? "Updating..." : "Accept Offer"}
              </button>

              <button
                type="button"
                onClick={() => handleDeclineOffer(offer)}
                disabled={updatingOfferId === offer.id}
                className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingOfferId === offer.id ? "Updating..." : "Decline Offer"}
              </button>
            </>
          ) : null}

          {kind === "sent" && offer.status === "pending" ? (
            <button
              type="button"
              onClick={() => handleWithdrawOffer(offer)}
              disabled={updatingOfferId === offer.id}
              className="cursor-pointer rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-black text-stone-950 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingOfferId === offer.id ? "Updating..." : "Withdraw Offer"}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header activePage="account" />

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Account
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Sign in to Archery Swap.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            Accounts are the foundation for seller profiles, real messaging,
            saved listings, offers, buying, and safer marketplace tools.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          {isLoadingSession ? (
            <div className="rounded-3xl border border-stone-300 bg-stone-50 p-6">
              <p className="font-black">Checking account status...</p>
            </div>
          ) : user ? (
            <>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
                  Signed In
                </p>

                <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950">
                  Your account is active.
                </h3>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                    Email
                  </p>
                  <p className="mt-2 break-words text-lg font-black text-stone-950">
                    {user.email}
                  </p>
                </div>

                <p className="mt-5 max-w-2xl text-base leading-7 text-stone-700">
                  This account is now connected to the listings you submit,
                  messages you send, and offers you make or receive.
                </p>

                {hasPendingReceivedOffers ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-900">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span>You have pending offers to review.</span>
                    </div>
                  </div>
                ) : null}

                {message ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-900">
                    {message}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/sell"
                    className="rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500"
                  >
                    List Gear
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-2xl bg-stone-950 px-5 py-4 text-center text-sm font-black text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </div>

              <section className="mt-8 rounded-3xl border border-stone-300 bg-stone-50 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black">My Offers</h3>

                      {hasPendingReceivedOffers ? (
                        <span
                          className="h-3 w-3 rounded-full bg-emerald-500"
                          title="Pending received offers"
                        />
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Review offers you sent as a buyer and offers you received
                      as a seller. Accepting an offer marks the listing sold and
                      hides it from Browse.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadMyOffers(user)}
                    disabled={isLoadingOffers}
                    className="cursor-pointer rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingOffers ? "Refreshing..." : "Refresh Offers"}
                  </button>
                </div>

                {offersErrorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {offersErrorMessage}
                  </div>
                ) : null}

                {offerActionMessage ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                    {offerActionMessage}
                  </div>
                ) : null}

                {offerActionErrorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {offerActionErrorMessage}
                  </div>
                ) : null}

                {isLoadingOffers ? (
                  <div className="mt-5 rounded-2xl border border-stone-300 bg-white p-5">
                    <p className="font-bold text-stone-700">
                      Loading your offers...
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <div>
                      <h4 className="text-lg font-black">Offers I Sent</h4>

                      {sentOffers.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-stone-300 bg-white p-5">
                          <p className="font-black">No sent offers yet.</p>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            When you make an offer on a listing, it will appear
                            here.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 grid gap-4">
                          {sentOffers.map((offer) =>
                            renderOfferCard(offer, "sent")
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black">Offers I Received</h4>

                        {hasPendingReceivedOffers ? (
                          <span
                            className="h-3 w-3 rounded-full bg-emerald-500"
                            title="Pending received offers"
                          />
                        ) : null}
                      </div>

                      {receivedOffers.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-stone-300 bg-white p-5">
                          <p className="font-black">No received offers yet.</p>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            When a buyer makes an offer on your listing, it will
                            appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 grid gap-4">
                          {receivedOffers.map((offer) =>
                            renderOfferCard(offer, "received")
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              <section className="mt-8 rounded-3xl border border-stone-300 bg-stone-50 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black">My Listings</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      These are the listings submitted from your signed-in
                      account. You can edit details, mark active listings
                      inactive, and review sold listings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadMyListings(user)}
                    disabled={isLoadingListings}
                    className="cursor-pointer rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingListings ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {listingsErrorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {listingsErrorMessage}
                  </div>
                ) : null}

                {listingActionMessage ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                    {listingActionMessage}
                  </div>
                ) : null}

                {listingActionErrorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {listingActionErrorMessage}
                  </div>
                ) : null}

                {isLoadingListings ? (
                  <div className="mt-5 rounded-2xl border border-stone-300 bg-white p-5">
                    <p className="font-bold text-stone-700">
                      Loading your listings...
                    </p>
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-stone-300 bg-white p-5">
                    <p className="font-black">No listings yet.</p>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      When you submit gear from the Sell page, it will appear
                      here.
                    </p>

                    <Link
                      href="/sell"
                      className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500"
                    >
                      Create a Listing
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4">
                    {myListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="rounded-2xl border border-stone-300 bg-white p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-black">
                              {listing.title}
                            </h4>

                            <p className="mt-1 text-sm font-bold text-stone-500">
                              Submitted {formatListingDate(listing.created_at)}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${statusClassName(
                              listing.status
                            )}`}
                          >
                            {statusLabel(listing.status)}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                          <div className="rounded-xl bg-stone-100 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                              Price
                            </p>
                            <p className="mt-1 font-black">
                              ${Number(listing.price).toLocaleString()}
                            </p>
                          </div>

                          <div className="rounded-xl bg-stone-100 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                              Category
                            </p>
                            <p className="mt-1 font-black">
                              {listing.category}
                            </p>
                          </div>

                          <div className="rounded-xl bg-stone-100 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                              Condition
                            </p>
                            <p className="mt-1 font-black">
                              {listing.condition}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href={`/account/listings/${listing.id}/edit`}
                            className="inline-block rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-black text-stone-950 hover:bg-stone-100"
                          >
                            Edit Listing
                          </Link>

                          {listing.status === "active" ? (
                            <Link
                              href={`/listing/${listing.id}`}
                              className="inline-block rounded-xl bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-stone-800"
                            >
                              View Public Listing
                            </Link>
                          ) : null}

                          {listing.status === "sold" ? (
                            <Link
                              href={`/listing/${listing.id}`}
                              className="inline-block rounded-xl bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-stone-800"
                            >
                              View Sold Listing
                            </Link>
                          ) : null}

                          {listing.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => handleMarkInactive(listing)}
                              disabled={updatingListingId === listing.id}
                              className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingListingId === listing.id
                                ? "Updating..."
                                : "Mark Inactive"}
                            </button>
                          ) : null}
                        </div>

                        {listing.status === "pending" ? (
                          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">
                            This listing is waiting for admin review. It will
                            not appear publicly until it is approved.
                          </p>
                        ) : null}

                        {listing.status === "denied" ? (
                          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-800">
                            <p>This listing was denied.</p>
                            {listing.denial_reason ? (
                              <p className="mt-2">
                                Reason: {listing.denial_reason}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        {listing.status === "inactive" ? (
                          <div className="mt-4 rounded-xl border border-stone-300 bg-stone-100 p-3 text-sm font-bold leading-6 text-stone-700">
                            <p>
                              This listing is inactive and is not visible in
                              Browse. You can reactivate it when you are ready.
                            </p>

                            <button
                              type="button"
                              onClick={() => handleReactivateListing(listing)}
                              disabled={updatingListingId === listing.id}
                              className="mt-4 cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingListingId === listing.id
                                ? "Updating..."
                                : "Reactivate Listing"}
                            </button>
                          </div>
                        ) : null}

                        {listing.status === "sold" ? (
                          <div className="mt-4 rounded-xl border border-stone-300 bg-stone-950 p-3 text-sm font-bold leading-6 text-white">
                            <p>
                              This listing is sold. It is hidden from Browse and
                              cannot be reactivated from this page.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="rounded-3xl border border-stone-300 bg-stone-50 p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-in");
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-black ${
                    mode === "sign-in"
                      ? "bg-stone-950 text-white"
                      : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-up");
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-black ${
                    mode === "sign-up"
                      ? "bg-stone-950 text-white"
                      : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h3 className="mt-6 text-3xl font-black tracking-tight text-stone-950">
                {mode === "sign-in"
                  ? "Sign in to your account."
                  : "Create your account."}
              </h3>

              <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">
                {mode === "sign-in"
                  ? "Use your email and password to sign in."
                  : "Create an account with your email and a password. Passwords must be at least 6 characters."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-black">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                {message ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                    {message}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Working..."
                    : mode === "sign-in"
                      ? "Sign In"
                      : "Create Account"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Seller profiles</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Sellers will be able to manage their profile, location, contact
                preferences, and gear listings.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Saved gear</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Buyers will be able to save listings and return to gear they are
                interested in later.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Listing control</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Users can edit listings, mark active listings inactive, review
                sold listings, and reactivate inactive listings.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-stone-100 p-5">
            <h3 className="text-xl font-black">Current status</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
              <li>• Browsing approved listings works now.</li>
              <li>• Submitting listings for review works now.</li>
              <li>• Admin approval tools work now.</li>
              <li>• Signed-in users can now view listings they submitted.</li>
              <li>• Active listings can now be marked inactive.</li>
              <li>• Inactive listings can now be reactivated.</li>
              <li>• Listing details can now be edited from My Listings.</li>
              <li>• Users can now view, accept, decline, and withdraw offers.</li>
              <li>
                • Accepted offers now mark listings sold and hide them from
                Browse.
              </li>
            </ul>
          </div>
        </div>

        <aside className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-2xl font-black">What accounts unlock</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Real messaging</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Account sign-in lets messages connect to the correct buyer,
                seller, and listing.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Offers and buying</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Accounts are needed before buyers can make offers, buy gear, and
                manage order history.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Saved listings</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Buyers will be able to save gear and return to listings they are
                considering.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950 p-5 text-white">
              <p className="font-black text-emerald-300">Next foundation step</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Next, we can add a cleaner buying action area with Buy Now and
                Make Offer side by side.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/messages"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              View Messages Page
            </Link>

            <Link
              href="/browse"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              Browse Gear
            </Link>

            <Link
              href="/sell"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              Sell Gear
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}