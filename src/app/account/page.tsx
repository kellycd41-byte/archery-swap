"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import AccountOrdersBox from "./AccountOrdersBox";
import PayoutSetupBox from "./PayoutSetupBox";
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

function sortPendingOffersFirst(offers: UserOffer[]) {
  return [...offers].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") {
      return -1;
    }

    if (a.status !== "pending" && b.status === "pending") {
      return 1;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function isInactiveOrSoldListing(listing: UserListing) {
  return listing.status === "inactive" || listing.status === "sold";
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
  const [payingAcceptedOfferId, setPayingAcceptedOfferId] = useState<
    string | null
  >(null);

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [activeOfferPanel, setActiveOfferPanel] = useState<
    "sent" | "received" | null
  >(null);
  const [isListingsOpen, setIsListingsOpen] = useState(false);
  const [activeListingPanel, setActiveListingPanel] = useState<
    "active" | "inactiveSold"
  >("active");

  const hasPendingReceivedOffers = receivedOffers.some(
    (offer) => offer.status === "pending"
  );

  const hasAcceptedSentOffers = sentOffers.some(
    (offer) => offer.status === "accepted"
  );

  const hasOfferAlert = hasPendingReceivedOffers || hasAcceptedSentOffers;

  const sortedSentOffers = sortPendingOffersFirst(sentOffers);
  const sortedReceivedOffers = sortPendingOffersFirst(receivedOffers);

  const activeListings = myListings.filter(
    (listing) => !isInactiveOrSoldListing(listing)
  );
  const inactiveSoldListings = myListings.filter((listing) =>
    isInactiveOrSoldListing(listing)
  );
  const visibleListings =
    activeListingPanel === "active" ? activeListings : inactiveSoldListings;

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
        setIsOffersOpen(false);
        setActiveOfferPanel(null);
        setIsListingsOpen(false);
        setActiveListingPanel("active");
        setPayingAcceptedOfferId(null);
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
    setIsOffersOpen(false);
    setActiveOfferPanel(null);
    setIsListingsOpen(false);
    setActiveListingPanel("active");
    setPayingAcceptedOfferId(null);
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

    setActiveListingPanel("inactiveSold");
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

    setActiveListingPanel("active");
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
      ).toLocaleString()} for "${listingTitle}"? The buyer will still need to pay before the listing is marked sold.`;
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
      setUpdatingOfferId(null);
      setOfferActionMessage(
        `Offer accepted for "${listingTitle}". The buyer still needs to pay before the listing is marked sold.`
      );

      await loadMyOffers(user);
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

  async function handlePayAcceptedOffer(offer: UserOffer) {
    setOfferActionMessage("");
    setOfferActionErrorMessage("");
    setPayingAcceptedOfferId(offer.id);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setOfferActionErrorMessage(
          "Please sign in again before paying for this accepted offer."
        );
        setPayingAcceptedOfferId(null);
        return;
      }

      const response = await fetch("/api/checkout/accepted-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          offerId: offer.id,
        }),
      });

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.url) {
        setOfferActionErrorMessage(
          result.error || "Accepted offer checkout could not be started."
        );
        setPayingAcceptedOfferId(null);
        return;
      }

      window.location.href = result.url;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while starting accepted offer checkout.";

      setOfferActionErrorMessage(errorMessage);
      setPayingAcceptedOfferId(null);
    }
  }

  function renderOfferCard(offer: UserOffer, kind: "sent" | "received") {
    const listing = getOfferListing(offer);
    const listingTitle = listing?.title || "Listing unavailable";
    const listingStatus = listing?.status || "";
    const needsResponse = kind === "received" && offer.status === "pending";
    const canPayAcceptedOffer =
      kind === "sent" && offer.status === "accepted" && listingStatus === "active";

    return (
      <div
        key={offer.id}
        className={`overflow-hidden rounded-2xl border bg-white ${
          needsResponse
            ? "border-emerald-300 shadow-sm"
            : canPayAcceptedOffer
              ? "border-emerald-300 shadow-sm"
              : "border-stone-300"
        }`}
      >
        {needsResponse ? (
          <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3">
            <p className="text-sm font-black text-emerald-900">
              Needs response — accept or decline this offer.
            </p>
          </div>
        ) : null}

        {canPayAcceptedOffer ? (
          <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3">
            <p className="text-sm font-black text-emerald-900">
              Offer accepted — complete checkout to buy this item.
            </p>
          </div>
        ) : null}

        <div className="p-5">
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

          <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
            {listing ? (
              <Link
                href={`/listing/${offer.listing_id}`}
                className="rounded-xl bg-stone-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-stone-800"
              >
                View Listing
              </Link>
            ) : null}

            {canPayAcceptedOffer ? (
              <button
                type="button"
                onClick={() => handlePayAcceptedOffer(offer)}
                disabled={payingAcceptedOfferId === offer.id}
                className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {payingAcceptedOfferId === offer.id
                  ? "Starting Checkout..."
                  : "Pay Accepted Offer"}
              </button>
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
      </div>
    );
  }

  function renderListingCard(listing: UserListing) {
    return (
      <div
        key={listing.id}
        className="rounded-2xl border border-stone-300 bg-stone-50 p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-black">{listing.title}</h4>

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
          <div className="rounded-xl bg-white p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Price
            </p>
            <p className="mt-1 font-black">
              ${Number(listing.price).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Category
            </p>
            <p className="mt-1 font-black">{listing.category}</p>
          </div>

          <div className="rounded-xl bg-white p-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
              Condition
            </p>
            <p className="mt-1 font-black">{listing.condition}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
          <Link
            href={`/account/listings/${listing.id}/edit`}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-sm font-black text-stone-950 hover:bg-stone-100"
          >
            Edit Listing
          </Link>

          {listing.status === "active" ? (
            <Link
              href={`/listing/${listing.id}`}
              className="rounded-xl bg-stone-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-stone-800"
            >
              View Public Listing
            </Link>
          ) : null}

          {listing.status === "sold" ? (
            <Link
              href={`/listing/${listing.id}`}
              className="rounded-xl bg-stone-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-stone-800"
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
            This listing is waiting for admin review. It will not appear
            publicly until it is approved.
          </p>
        ) : null}

        {listing.status === "denied" ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold leading-6 text-red-800">
            <p>This listing was denied.</p>
            {listing.denial_reason ? (
              <p className="mt-2">Reason: {listing.denial_reason}</p>
            ) : null}
          </div>
        ) : null}

        {listing.status === "inactive" ? (
          <div className="mt-4 rounded-xl border border-stone-300 bg-white p-3 text-sm font-bold leading-6 text-stone-700">
            <p>
              This listing is inactive and is not visible in Browse. You can
              reactivate it when you are ready.
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
              This listing is sold. It is hidden from Browse and cannot be
              reactivated from this page.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header activePage="account" />

      <section className="bg-stone-950 px-4 py-10 text-white sm:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Account
          </p>

          <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
            Manage your Archery Outlet account.
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            View your listings, track offers, and manage buyer and seller
            activity from one place.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_340px]">
        <div>
          {isLoadingSession ? (
            <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
              <p className="font-black">Checking account status...</p>
            </div>
          ) : user ? (
            <>
              <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                      Signed In
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-tight">
                      Your account is active.
                    </h3>

                    <p className="mt-2 break-words text-sm font-bold text-stone-600">
                      {user.email}
                    </p>
                  </div>

                  <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                    <Link
                      href="/sell"
                      className="rounded-xl bg-emerald-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-emerald-500"
                    >
                      List Gear
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSubmitting}
                      className="cursor-pointer rounded-xl bg-stone-950 px-5 py-3 text-center text-sm font-black text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? "Signing Out..." : "Sign Out"}
                    </button>
                  </div>
                </div>

                {hasPendingReceivedOffers ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span>You have pending offers to review.</span>
                    </div>
                  </div>
                ) : null}

                {message ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                    {message}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {errorMessage}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 grid gap-5">
                <PayoutSetupBox />

                <AccountOrdersBox user={user} />

                <section className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOffersOpen((currentValue) => !currentValue);

                      if (isOffersOpen) {
                        setActiveOfferPanel(null);
                      }
                    }}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-stone-300 bg-stone-50 px-5 py-4 text-left hover:bg-stone-100"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black">My Offers</h3>

                        {hasOfferAlert ? (
                          <span
                            className="h-3 w-3 rounded-full bg-emerald-500"
                            title={
                              hasAcceptedSentOffers
                                ? "Accepted offer ready for payment"
                                : "Pending received offers"
                            }
                          />
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
                        View offers you sent and offers buyers sent to you.
                      </p>
                    </div>

                    <span className="rounded-full bg-stone-950 px-3 py-1 text-sm font-black text-white">
                      {isOffersOpen ? "Close" : "Open"}
                    </span>
                  </button>

                  {isOffersOpen ? (
                    <div className="mt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveOfferPanel((currentValue) =>
                                currentValue === "sent" ? null : "sent"
                              )
                            }
                            className={`cursor-pointer rounded-2xl px-5 py-4 text-left font-black ${
                              activeOfferPanel === "sent"
                                ? "bg-stone-950 text-white"
                                : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              Offers I Sent
                              {hasAcceptedSentOffers ? (
                                <span
                                  className="h-3 w-3 rounded-full bg-emerald-500"
                                  title="Accepted offer ready for payment"
                                />
                              ) : null}
                            </span>

                            <span className="ml-2 rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-900">
                              {sentOffers.length}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveOfferPanel((currentValue) =>
                                currentValue === "received" ? null : "received"
                              )
                            }
                            className={`cursor-pointer rounded-2xl px-5 py-4 text-left font-black ${
                              activeOfferPanel === "received"
                                ? "bg-stone-950 text-white"
                                : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              Offers I Received
                              {hasPendingReceivedOffers ? (
                                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                              ) : null}
                            </span>

                            <span className="ml-2 rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-900">
                              {receivedOffers.length}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => loadMyOffers(user)}
                          disabled={isLoadingOffers}
                          className="w-full cursor-pointer rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
                        <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                          <p className="font-bold text-stone-700">
                            Loading your offers...
                          </p>
                        </div>
                      ) : null}

                      {!isLoadingOffers && activeOfferPanel === "sent" ? (
                        <div className="mt-5 rounded-3xl border border-stone-300 bg-stone-50 p-4 sm:p-5">
                          <div className="rounded-2xl border border-stone-200 bg-white p-4">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                              Buying
                            </p>
                            <h4 className="mt-1 text-xl font-black">
                              Offers I Sent
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-stone-600">
                              These are offers you made on other sellers&apos;
                              listings.
                            </p>
                          </div>

                          {sortedSentOffers.length === 0 ? (
                            <div className="mt-4 rounded-2xl border border-stone-300 bg-white p-5">
                              <p className="font-black">No sent offers yet.</p>
                              <p className="mt-2 text-sm leading-6 text-stone-600">
                                When you make an offer on a listing, it will
                                appear here.
                              </p>
                            </div>
                          ) : (
                            <div className="mt-4 grid gap-4">
                              {sortedSentOffers.map((offer) =>
                                renderOfferCard(offer, "sent")
                              )}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {!isLoadingOffers && activeOfferPanel === "received" ? (
                        <div className="mt-5 rounded-3xl border border-stone-300 bg-stone-50 p-4 sm:p-5">
                          <div className="rounded-2xl border border-stone-200 bg-white p-4">
                            <div className="flex items-center gap-3">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                                Selling
                              </p>

                              {hasPendingReceivedOffers ? (
                                <span
                                  className="h-3 w-3 rounded-full bg-emerald-500"
                                  title="Pending received offers"
                                />
                              ) : null}
                            </div>

                            <h4 className="mt-1 text-xl font-black">
                              Offers I Received
                            </h4>

                            <p className="mt-2 text-sm leading-6 text-stone-600">
                              These are offers buyers made on your listings.
                              Pending offers appear first.
                            </p>
                          </div>

                          {sortedReceivedOffers.length === 0 ? (
                            <div className="mt-4 rounded-2xl border border-stone-300 bg-white p-5">
                              <p className="font-black">
                                No received offers yet.
                              </p>
                              <p className="mt-2 text-sm leading-6 text-stone-600">
                                When a buyer makes an offer on your listing, it
                                will appear here.
                              </p>
                            </div>
                          ) : (
                            <div className="mt-4 grid gap-4">
                              {sortedReceivedOffers.map((offer) =>
                                renderOfferCard(offer, "received")
                              )}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {!isLoadingOffers && !activeOfferPanel ? (
                        <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                          <p className="font-black">Choose an offer list.</p>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            Click Offers I Sent or Offers I Received to open
                            that list.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
                  <button
                    type="button"
                    onClick={() =>
                      setIsListingsOpen((currentValue) => !currentValue)
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-stone-300 bg-stone-50 px-5 py-4 text-left hover:bg-stone-100"
                  >
                    <div>
                      <h3 className="text-2xl font-black">My Listings</h3>
                      <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
                        View, edit, deactivate, reactivate, and review your
                        listings.
                      </p>
                    </div>

                    <span className="rounded-full bg-stone-950 px-3 py-1 text-sm font-black text-white">
                      {isListingsOpen ? "Close" : "Open"}
                    </span>
                  </button>

                  {isListingsOpen ? (
                    <div className="mt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-bold leading-6 text-stone-600">
                          You currently have {myListings.length} listing
                          {myListings.length === 1 ? "" : "s"} in your account.
                        </p>

                        <button
                          type="button"
                          onClick={() => loadMyListings(user)}
                          disabled={isLoadingListings}
                          className="w-full cursor-pointer rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

                      {!isLoadingListings && myListings.length > 0 ? (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setActiveListingPanel("active")}
                            className={`cursor-pointer rounded-2xl px-5 py-4 text-left font-black ${
                              activeListingPanel === "active"
                                ? "bg-stone-950 text-white"
                                : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                            }`}
                          >
                            Active Listings
                            <span className="ml-2 rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-900">
                              {activeListings.length}
                            </span>
                            <span className="mt-1 block text-xs font-bold opacity-80">
                              Approved, pending, and denied
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveListingPanel("inactiveSold")
                            }
                            className={`cursor-pointer rounded-2xl px-5 py-4 text-left font-black ${
                              activeListingPanel === "inactiveSold"
                                ? "bg-stone-950 text-white"
                                : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                            }`}
                          >
                            Inactive / Sold
                            <span className="ml-2 rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-900">
                              {inactiveSoldListings.length}
                            </span>
                            <span className="mt-1 block text-xs font-bold opacity-80">
                              Hidden or completed listings
                            </span>
                          </button>
                        </div>
                      ) : null}

                      {isLoadingListings ? (
                        <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                          <p className="font-bold text-stone-700">
                            Loading your listings...
                          </p>
                        </div>
                      ) : myListings.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                          <p className="font-black">No listings yet.</p>
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            When you submit gear from the Sell page, it will
                            appear here.
                          </p>

                          <Link
                            href="/sell"
                            className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500"
                          >
                            Create a Listing
                          </Link>
                        </div>
                      ) : visibleListings.length === 0 ? (
                        <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                          <p className="font-black">
                            {activeListingPanel === "active"
                              ? "No active listings in this tab."
                              : "No inactive or sold listings in this tab."}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {activeListingPanel === "active"
                              ? "Approved, pending, and denied listings will appear here."
                              : "Listings you mark inactive or sell will appear here."}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-5 grid gap-4">
                          {visibleListings.map((listing) =>
                            renderListingCard(listing)
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </section>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
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

              <h3 className="mt-6 text-2xl font-black tracking-tight text-stone-950">
                {mode === "sign-in"
                  ? "Sign in to your account."
                  : "Create your account."}
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-700">
                {mode === "sign-in"
                  ? "Use your email and password to sign in."
                  : "Create an account with your email and a password. Passwords must be at least 6 characters."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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
        </div>

        <aside className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-2xl font-black">Account tools</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Messages</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                View buyer and seller conversations connected to your listings.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Offers</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Track offers you sent and respond to offers buyers made on your
                listings.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Listings</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Edit listings, mark active listings inactive, and review sold
                listings.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/messages"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              View Messages
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