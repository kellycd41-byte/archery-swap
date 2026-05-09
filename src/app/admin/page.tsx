"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string | null;
  image_url: string | null;
  seller_name: string | null;
  seller_email: string | null;
  status: string;
  created_at: string;
  brand: string | null;
  model: string | null;
};

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadListings() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setListings([]);
      setIsLoading(false);
      return;
    }

    setListings((data || []) as Listing[]);
    setIsLoading(false);
  }

  async function markListingInactive(listingId: string, listingTitle: string) {
    const confirmed = window.confirm(
      `Remove this listing from Browse?\n\n${listingTitle}\n\nThis will mark it inactive instead of permanently deleting it.`
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status: "inactive" })
      .eq("id", listingId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setActionMessage(`Removed "${listingTitle}" from the marketplace.`);
    await loadListings();
  }

  async function restoreListing(listingId: string, listingTitle: string) {
    const confirmed = window.confirm(
      `Restore this listing to Browse?\n\n${listingTitle}`
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({ status: "active" })
      .eq("id", listingId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setActionMessage(`Restored "${listingTitle}" to the marketplace.`);
    await loadListings();
  }

  useEffect(() => {
    loadListings();
  }, []);

  const activeListings = listings.filter(
    (listing) => listing.status === "active"
  );
  const inactiveListings = listings.filter(
    (listing) => listing.status !== "active"
  );
  const listingsWithPhotos = listings.filter((listing) => listing.image_url);
  const listingsWithoutPhotos = listings.filter((listing) => !listing.image_url);

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <header className="border-b border-stone-300 bg-stone-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="block">
            <h1 className="text-2xl font-black tracking-tight">
              Archery Swap
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
              Buy • Sell • Archery Gear
            </p>
          </Link>

          <nav className="hidden gap-6 text-sm font-bold md:flex">
            <Link href="/" className="hover:text-emerald-300">
              Home
            </Link>
            <Link href="/browse" className="hover:text-emerald-300">
              Browse Gear
            </Link>
            <Link href="/sell" className="hover:text-emerald-300">
              Sell Gear
            </Link>
            <Link href="/messages" className="hover:text-emerald-300">
              Messages
            </Link>
            <Link href="/account" className="hover:text-emerald-300">
              Account
            </Link>
            <Link href="/admin" className="text-emerald-300">
              Admin
            </Link>
          </nav>

          <Link
            href="/sell"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
          >
            Sell Your Gear
          </Link>
        </div>
      </header>

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Admin Dashboard
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            Manage real Archery Swap listings.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Review listings, hide test posts from the marketplace, and restore
            listings when needed. This page will be protected by admin login
            later.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {actionMessage ? (
          <div className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            {actionMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">
              Total listings
            </p>
            <p className="mt-3 text-4xl font-black">{listings.length}</p>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">
              Active listings
            </p>
            <p className="mt-3 text-4xl font-black">{activeListings.length}</p>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">
              Inactive listings
            </p>
            <p className="mt-3 text-4xl font-black">
              {inactiveListings.length}
            </p>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">
              With photos
            </p>
            <p className="mt-3 text-4xl font-black">
              {listingsWithPhotos.length}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-black">All listings</h3>
              <p className="text-stone-600">
                Mark test listings inactive to remove them from Browse without
                permanently deleting them.
              </p>
              <p className="mt-1 text-sm font-bold text-stone-500">
                Listings without photos: {listingsWithoutPhotos.length}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={loadListings}
                className="rounded-xl border border-stone-400 px-4 py-2 text-sm font-black hover:bg-stone-100"
              >
                Refresh
              </button>

              <Link
                href="/browse"
                className="rounded-xl bg-stone-950 px-4 py-2 text-center text-sm font-black text-white hover:bg-stone-800"
              >
                View Marketplace
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-6 text-center font-bold text-stone-600">
              Loading listings...
            </div>
          ) : null}

          {!isLoading && listings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-6 text-center">
              <h4 className="text-xl font-black">No listings found</h4>
              <p className="mt-2 text-stone-600">
                Create a test listing from the Sell page first.
              </p>
            </div>
          ) : null}

          {!isLoading && listings.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-stone-300">
              <div className="hidden grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.7fr_0.8fr] gap-4 bg-stone-950 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white md:grid">
                <div>Listing</div>
                <div>Category</div>
                <div>Price</div>
                <div>Status</div>
                <div>Created</div>
                <div>Actions</div>
              </div>

              <div className="divide-y divide-stone-300 bg-white">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="grid gap-4 px-4 py-5 md:grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.7fr_0.8fr] md:items-center"
                  >
                    <div>
                      <p className="text-lg font-black">{listing.title}</p>

                      <p className="mt-1 text-sm font-bold text-stone-500">
                        {listing.brand || "No brand"}
                        {listing.model ? ` ${listing.model}` : ""} •{" "}
                        {listing.condition}
                      </p>

                      <p className="mt-1 text-xs font-bold text-stone-400">
                        Seller: {listing.seller_name || "Not listed"}
                      </p>

                      <p className="mt-1 text-xs font-bold text-stone-400">
                        Photo: {listing.image_url ? "Yes" : "No"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500 md:hidden">
                        Category
                      </p>
                      <p className="font-bold">{listing.category}</p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500 md:hidden">
                        Price
                      </p>
                      <p className="font-black">
                        ${Number(listing.price).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500 md:hidden">
                        Status
                      </p>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-black ${
                          listing.status === "active"
                            ? "bg-emerald-50 text-emerald-900"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500 md:hidden">
                        Created
                      </p>
                      <p className="text-sm font-bold text-stone-600">
                        {formatDate(listing.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {listing.status === "active" ? (
                        <Link
                          href={`/listing/${listing.id}`}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-black text-white hover:bg-emerald-500"
                        >
                          View
                        </Link>
                      ) : null}

                      {listing.status === "active" ? (
                        <button
                          type="button"
                          onClick={() =>
                            markListingInactive(listing.id, listing.title)
                          }
                          className="rounded-xl border border-red-300 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            restoreListing(listing.id, listing.title)
                          }
                          className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-black text-emerald-800 hover:bg-emerald-50"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 rounded-3xl bg-stone-950 p-6 text-white">
          <h3 className="text-2xl font-black">Admin note</h3>
          <p className="mt-3 max-w-4xl leading-8 text-stone-300">
            This admin page is currently for development only. Later we will add
            real admin login protection so only approved admins can remove or
            restore listings.
          </p>
        </div>
      </section>
    </main>
  );
}