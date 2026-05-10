"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [sellerSearchText, setSellerSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [photoFilter, setPhotoFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  async function deleteListingForever(listingId: string, listingTitle: string) {
    const confirmed = window.confirm(
      `Permanently delete this listing?\n\n${listingTitle}\n\nThis cannot be undone. Only inactive listings should be deleted forever.`
    );

    if (!confirmed) {
      return;
    }

    const confirmedAgain = window.confirm(
      `Are you absolutely sure?\n\n"${listingTitle}" will be permanently deleted from the database.`
    );

    if (!confirmedAgain) {
      return;
    }

    setActionMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .neq("status", "active");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setActionMessage(`Permanently deleted "${listingTitle}".`);
    await loadListings();
  }

  function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const typedPassword = passwordInput.trim();
    const savedPassword = adminPassword.trim();

    setPasswordError("");

    if (!savedPassword) {
      setPasswordError(
        "Admin password is missing. Check NEXT_PUBLIC_ADMIN_PASSWORD in .env.local, then restart npm run dev."
      );
      return;
    }

    if (typedPassword !== savedPassword) {
      setPasswordError("Incorrect password. Please try again.");
      return;
    }

    window.sessionStorage.setItem("archerySwapAdminUnlocked", "true");
    setIsAdminUnlocked(true);
    setPasswordInput("");
  }

  function handleAdminLogout() {
    window.sessionStorage.removeItem("archerySwapAdminUnlocked");
    setIsAdminUnlocked(false);
    setListings([]);
    setActionMessage("");
    setErrorMessage("");
    setPasswordInput("");
    setPasswordError("");
    setSearchText("");
    setSellerSearchText("");
    setStatusFilter("all");
    setPhotoFilter("all");
    setCategoryFilter("all");
  }

  function clearFilters() {
    setSearchText("");
    setSellerSearchText("");
    setStatusFilter("all");
    setPhotoFilter("all");
    setCategoryFilter("all");
  }

  useEffect(() => {
    const savedAdminAccess = window.sessionStorage.getItem(
      "archerySwapAdminUnlocked"
    );

    if (savedAdminAccess === "true") {
      setIsAdminUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isAdminUnlocked) {
      loadListings();
    }
  }, [isAdminUnlocked]);

  const activeListings = listings.filter(
    (listing) => listing.status === "active"
  );
  const inactiveListings = listings.filter(
    (listing) => listing.status !== "active"
  );
  const listingsWithPhotos = listings.filter((listing) => listing.image_url);
  const listingsWithoutPhotos = listings.filter((listing) => !listing.image_url);

  const categories = Array.from(
    new Set(
      listings
        .map((listing) => listing.category)
        .filter((category) => category && category.trim().length > 0)
    )
  ).sort();

  const filteredListings = listings.filter((listing) => {
    const search = searchText.trim().toLowerCase();
    const sellerSearch = sellerSearchText.trim().toLowerCase();

    const searchableText = [
      listing.title,
      listing.description,
      listing.category,
      listing.condition,
      listing.location || "",
      listing.seller_name || "",
      listing.seller_email || "",
      listing.brand || "",
      listing.model || "",
      listing.status,
    ]
      .join(" ")
      .toLowerCase();

    const sellerText = [listing.seller_name || "", listing.seller_email || ""]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || searchableText.includes(search);
    const matchesSellerSearch =
      !sellerSearch || sellerText.includes(sellerSearch);

    const matchesStatus =
      statusFilter === "all" || listing.status === statusFilter;

    const matchesPhoto =
      photoFilter === "all" ||
      (photoFilter === "with-photos" && Boolean(listing.image_url)) ||
      (photoFilter === "without-photos" && !listing.image_url);

    const matchesCategory =
      categoryFilter === "all" || listing.category === categoryFilter;

    return (
      matchesSearch &&
      matchesSellerSearch &&
      matchesStatus &&
      matchesPhoto &&
      matchesCategory
    );
  });

  const filtersAreActive =
    searchText.trim() !== "" ||
    sellerSearchText.trim() !== "" ||
    statusFilter !== "all" ||
    photoFilter !== "all" ||
    categoryFilter !== "all";

  if (!isAdminUnlocked) {
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

            <Link
              href="/"
              className="rounded-xl border border-stone-500 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
            >
              Back Home
            </Link>
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-82px)] items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
              Admin Access
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Enter admin password.
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              This temporary password gate keeps casual visitors away from the
              admin dashboard while Archery Swap is still in development.
            </p>

            <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-password"
                  className="text-sm font-black uppercase tracking-[0.14em] text-stone-700"
                >
                  Password
                </label>

                <input
                  id="admin-password"
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  placeholder="Enter password"
                />
              </div>

              {passwordError ? (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-800">
                  {passwordError}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500"
              >
                Unlock Admin
              </button>
            </form>

            <div className="mt-5 rounded-2xl bg-stone-100 p-4 text-sm font-bold text-stone-600">
              Admin password setting:{" "}
              {adminPassword ? "Loaded" : "Missing from .env.local"}
            </div>

            <p className="mt-5 text-sm font-bold text-stone-500">
              Later, this will be replaced with real admin accounts using
              Supabase Auth.
            </p>
          </div>
        </section>
      </main>
    );
  }

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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAdminLogout}
              className="rounded-xl border border-stone-500 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
            >
              Lock Admin
            </button>

            <Link
              href="/sell"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
            >
              Sell Your Gear
            </Link>
          </div>
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
            Review listings, hide test posts from the marketplace, restore
            listings when needed, permanently delete inactive listings, and
            quickly search for the exact listing you need.
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
              <h3 className="text-2xl font-black">Find listings</h3>
              <p className="text-stone-600">
                Search by listing details, seller name, seller email, status,
                photos, or category.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-stone-400 px-4 py-2 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!filtersAreActive}
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <label
                htmlFor="admin-search"
                className="text-sm font-black uppercase tracking-[0.14em] text-stone-700"
              >
                Search Listings
              </label>

              <input
                id="admin-search"
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                placeholder="Search title, brand, model, category..."
              />
            </div>

            <div>
              <label
                htmlFor="seller-search"
                className="text-sm font-black uppercase tracking-[0.14em] text-stone-700"
              >
                Search Seller
              </label>

              <input
                id="seller-search"
                type="text"
                value={sellerSearchText}
                onChange={(event) => setSellerSearchText(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                placeholder="Search seller name or email..."
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <label
                htmlFor="status-filter"
                className="text-sm font-black uppercase tracking-[0.14em] text-stone-700"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="photo-filter"
                className="text-sm font-black uppercase tracking-[0.14em] text-stone-700"
              >
                Photos
              </label>

              <select
                id="photo-filter"
                value={photoFilter}
                onChange={(event) => setPhotoFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
              >
                <option value="all">All photo statuses</option>
                <option value="with-photos">With photos</option>
                <option value="without-photos">Without photos</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="text-sm font-black uppercase tracking-[0.14em] text-stone-700"
              >
                Category
              </label>

              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-4 text-sm font-bold text-stone-500">
            Showing {filteredListings.length} of {listings.length} listings.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-black">All listings</h3>
              <p className="text-stone-600">
                Active listings can be removed from Browse. Inactive listings
                can be restored or permanently deleted.
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

          {!isLoading && listings.length > 0 && filteredListings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-6 text-center">
              <h4 className="text-xl font-black">No matching listings</h4>
              <p className="mt-2 text-stone-600">
                Try clearing the search box or changing the filters.
              </p>
            </div>
          ) : null}

          {!isLoading && filteredListings.length > 0 ? (
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
                {filteredListings.map((listing) => (
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
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              restoreListing(listing.id, listing.title)
                            }
                            className="rounded-xl border border-emerald-300 px-4 py-2 text-sm font-black text-emerald-800 hover:bg-emerald-50"
                          >
                            Restore
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteListingForever(listing.id, listing.title)
                            }
                            className="rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-sm font-black text-red-800 hover:bg-red-100"
                          >
                            Delete Forever
                          </button>
                        </>
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
            This admin page is protected with a temporary password gate. Active
            listings should be removed first, then inactive listings can be
            restored or permanently deleted. Search and filters only change what
            you see on this page; they do not change the database.
          </p>
        </div>
      </section>
    </main>
  );
}