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
  denial_reason: string | null;
  created_at: string;
  brand: string | null;
  model: string | null;
};

type AdminOrderListing = {
  id: string;
  title: string;
};

type AdminOrder = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  item_amount: number;
  shipping_amount: number;
  platform_fee_amount: number;
  seller_payout_amount: number | null;
  total_amount: number;
  status: string;
  transfer_status: string | null;
  stripe_connected_account_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_transfer_id: string | null;
  shipping_carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  seller_payout_released_at: string | null;
  paid_at: string | null;
  created_at: string;
  listing: AdminOrderListing | null;
};

type EditForm = {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  location: string;
  seller_name: string;
  seller_email: string;
  brand: string;
  model: string;
  status: string;
  denial_reason: string;
};

function formatMoney(value: number | null) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "Unknown date";
  }

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

function makeEditForm(listing: Listing): EditForm {
  return {
    title: listing.title || "",
    description: listing.description || "",
    price: String(listing.price || ""),
    category: listing.category || "",
    condition: listing.condition || "",
    location: listing.location || "",
    seller_name: listing.seller_name || "",
    seller_email: listing.seller_email || "",
    brand: listing.brand || "",
    model: listing.model || "",
    status: listing.status || "pending",
    denial_reason: listing.denial_reason || "",
  };
}

function getOrderStatusBadgeClasses(status: string) {
  if (status === "shipped") {
    return "bg-blue-100 text-blue-900";
  }

  if (status === "paid") {
    return "bg-emerald-100 text-emerald-900";
  }

  return "bg-stone-200 text-stone-700";
}

function getTransferStatusBadgeClasses(status: string | null) {
  if (status === "released") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "not_released") {
    return "bg-amber-100 text-amber-900";
  }

  return "bg-stone-200 text-stone-700";
}

function getStatusBadgeClasses(status: string) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-900";
  }

  if (status === "pending") {
    return "bg-yellow-100 text-yellow-900";
  }

  if (status === "denied") {
    return "bg-red-100 text-red-900";
  }

  return "bg-stone-200 text-stone-700";
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

  const [editingListingId, setEditingListingId] = useState("");
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersErrorMessage, setOrdersErrorMessage] = useState("");
  const [releasingOrderId, setReleasingOrderId] = useState<string | null>(null);

  async function loadAdminOrders() {
    setIsLoadingOrders(true);
    setOrdersErrorMessage("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword,
        }),
      });

      const result = (await response.json()) as {
        orders?: AdminOrder[];
        error?: string;
      };

      if (!response.ok || !result.orders) {
        setOrdersErrorMessage(
          result.error || "Admin orders could not be loaded."
        );
        setAdminOrders([]);
        setIsLoadingOrders(false);
        return;
      }

      setAdminOrders(result.orders);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while loading admin orders.";

      setOrdersErrorMessage(message);
      setAdminOrders([]);
    }

    setIsLoadingOrders(false);
  }

  async function releaseSellerPayment(order: AdminOrder) {
    const listingTitle = order.listing?.title || "this order";

    const confirmed = window.confirm(
      `Release seller payment for "${listingTitle}"?\n\nOnly do this after you verify the shipment is real and at least in transit.`
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    setErrorMessage("");
    setOrdersErrorMessage("");
    setReleasingOrderId(order.id);

    try {
      const response = await fetch("/api/orders/release-seller-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          adminPassword,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        transferId?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setOrdersErrorMessage(
          result.error || "Seller payment could not be released."
        );
        setReleasingOrderId(null);
        return;
      }

      setActionMessage(
        `Seller payment released for "${listingTitle}". Stripe transfer: ${result.transferId}`
      );

      await loadAdminOrders();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while releasing seller payment.";

      setOrdersErrorMessage(message);
    }

    setReleasingOrderId(null);
  }

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

  async function approveListing(listingId: string, listingTitle: string) {
    const confirmed = window.confirm(
      `Approve this listing?\n\n${listingTitle}\n\nThis will make it visible on Browse.`
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "active",
        denial_reason: null,
      })
      .eq("id", listingId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setActionMessage(`Approved "${listingTitle}". It is now visible on Browse.`);
    await loadListings();
  }

  async function denyListing(listingId: string, listingTitle: string) {
    const reason = window.prompt(
      `Why are you denying this listing?\n\n${listingTitle}\n\nExample: Photo is blurry. Please upload a clearer photo.`
    );

    if (reason === null) {
      return;
    }

    const cleanedReason = reason.trim();

    if (!cleanedReason) {
      setErrorMessage("A denial reason is required.");
      return;
    }

    const confirmed = window.confirm(
      `Deny this listing?\n\n${listingTitle}\n\nReason:\n${cleanedReason}`
    );

    if (!confirmed) {
      return;
    }

    setActionMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "denied",
        denial_reason: cleanedReason,
      })
      .eq("id", listingId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setActionMessage(`Denied "${listingTitle}".`);
    await loadListings();
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
      .update({
        status: "inactive",
        denial_reason: null,
      })
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
      .update({
        status: "active",
        denial_reason: null,
      })
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
      `Permanently delete this listing?\n\n${listingTitle}\n\nThis cannot be undone. Active listings should be removed first.`
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

  function startEditingListing(listing: Listing) {
    setActionMessage("");
    setErrorMessage("");
    setEditingListingId(listing.id);
    setEditForm(makeEditForm(listing));
  }

  function cancelEditingListing() {
    setEditingListingId("");
    setEditForm(null);
    setIsSavingEdit(false);
    setAdminOrders([]);
    setOrdersErrorMessage("");
    setIsLoadingOrders(false);
    setReleasingOrderId(null);
  }

  function updateEditForm(field: keyof EditForm, value: string) {
    setEditForm((currentForm) => {
      if (!currentForm) {
        return currentForm;
      }

      return {
        ...currentForm,
        [field]: value,
      };
    });
  }

  async function saveListingEdits(listingId: string) {
    if (!editForm) {
      return;
    }

    const cleanedTitle = editForm.title.trim();
    const cleanedPrice = Number(editForm.price);
    const cleanedCategory = editForm.category.trim();
    const cleanedCondition = editForm.condition.trim();
    const cleanedStatus = editForm.status.trim();
    const cleanedDenialReason = editForm.denial_reason.trim();

    setActionMessage("");
    setErrorMessage("");

    if (!cleanedTitle) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!editForm.price.trim() || Number.isNaN(cleanedPrice) || cleanedPrice < 0) {
      setErrorMessage("Price must be a valid number.");
      return;
    }

    if (!cleanedCategory) {
      setErrorMessage("Category is required.");
      return;
    }

    if (!cleanedCondition) {
      setErrorMessage("Condition is required.");
      return;
    }

    if (
      cleanedStatus !== "pending" &&
      cleanedStatus !== "active" &&
      cleanedStatus !== "inactive" &&
      cleanedStatus !== "denied"
    ) {
      setErrorMessage("Status must be pending, active, inactive, or denied.");
      return;
    }

    if (cleanedStatus === "denied" && !cleanedDenialReason) {
      setErrorMessage("Denied listings need a denial reason.");
      return;
    }

    setIsSavingEdit(true);

    const { error } = await supabase
      .from("listings")
      .update({
        title: cleanedTitle,
        description: editForm.description.trim(),
        price: cleanedPrice,
        category: cleanedCategory,
        condition: cleanedCondition,
        location: editForm.location.trim() || null,
        seller_name: editForm.seller_name.trim() || null,
        seller_email: editForm.seller_email.trim() || null,
        brand: editForm.brand.trim() || null,
        model: editForm.model.trim() || null,
        status: cleanedStatus,
        denial_reason:
          cleanedStatus === "denied" ? cleanedDenialReason : null,
      })
      .eq("id", listingId);

    setIsSavingEdit(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setActionMessage(`Updated "${cleanedTitle}".`);
    setEditingListingId("");
    setEditForm(null);
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
    setEditingListingId("");
    setEditForm(null);
    setIsSavingEdit(false);
    setAdminOrders([]);
    setOrdersErrorMessage("");
    setIsLoadingOrders(false);
    setReleasingOrderId(null);
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
      loadAdminOrders();
    }
  }, [isAdminUnlocked]);

  const activeListings = listings.filter(
    (listing) => listing.status === "active"
  );
  const pendingListings = listings.filter(
    (listing) => listing.status === "pending"
  );
  const deniedListings = listings.filter(
    (listing) => listing.status === "denied"
  );
  const inactiveListings = listings.filter(
    (listing) => listing.status === "inactive"
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
      listing.denial_reason || "",
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

  const ordersReadyForRelease = adminOrders.filter(
    (order) =>
      order.status === "shipped" &&
      order.transfer_status === "not_released" &&
      Boolean(order.shipping_carrier) &&
      Boolean(order.tracking_number) &&
      Boolean(order.shipped_at)
  );

  const releasedOrders = adminOrders.filter(
    (order) => order.transfer_status === "released"
  );

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
                Archery Outlet
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
              admin dashboard while Archery Outlet is still in development.
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
              Archery Outlet
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
            Review and manage Archery Outlet listings.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Pending listings can be approved or denied. Active listings appear
            on Browse. Denied listings can store a reason for the seller.
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

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">
              Total
            </p>
            <p className="mt-3 text-4xl font-black">{listings.length}</p>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-800">
              Pending
            </p>
            <p className="mt-3 text-4xl font-black">{pendingListings.length}</p>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">
              Active
            </p>
            <p className="mt-3 text-4xl font-black">{activeListings.length}</p>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-red-800">
              Denied
            </p>
            <p className="mt-3 text-4xl font-black">{deniedListings.length}</p>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-stone-700">
              Inactive
            </p>
            <p className="mt-3 text-4xl font-black">
              {inactiveListings.length}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-black">
                Orders waiting for seller payment release
              </h3>
              <p className="mt-2 text-stone-600">
                Review shipment details before releasing seller payout. Only
                release after shipment is verified as real and at least in
                transit.
              </p>
            </div>

            <button
              type="button"
              onClick={loadAdminOrders}
              className="rounded-xl border border-stone-400 px-4 py-2 text-sm font-black hover:bg-stone-100"
            >
              {isLoadingOrders ? "Refreshing..." : "Refresh Orders"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-stone-100 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-600">
                Ready to Review
              </p>
              <p className="mt-2 text-3xl font-black">
                {ordersReadyForRelease.length}
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-600">
                Released
              </p>
              <p className="mt-2 text-3xl font-black">
                {releasedOrders.length}
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-600">
                Total Paid/Shipped
              </p>
              <p className="mt-2 text-3xl font-black">{adminOrders.length}</p>
            </div>
          </div>

          {ordersErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-800">
              {ordersErrorMessage}
            </div>
          ) : null}

          {isLoadingOrders ? (
            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5 text-sm font-bold text-stone-700">
              Loading admin orders...
            </div>
          ) : null}

          {!isLoadingOrders && ordersReadyForRelease.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="font-black">No orders ready for release.</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Once a seller submits tracking, shipped orders waiting for
                payout release will appear here.
              </p>
            </div>
          ) : null}

          {!isLoadingOrders && ordersReadyForRelease.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {ordersReadyForRelease.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-stone-300 bg-stone-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h4 className="text-xl font-black">
                        {order.listing?.title || "Listing unavailable"}
                      </h4>
                      <p className="mt-1 text-sm font-bold text-stone-500">
                        Paid {formatDate(order.paid_at || order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${getOrderStatusBadgeClasses(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${getTransferStatusBadgeClasses(
                          order.transfer_status
                        )}`}
                      >
                        {order.transfer_status || "unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                        Seller Payout
                      </p>
                      <p className="mt-1 font-black">
                        {formatMoney(order.seller_payout_amount)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                        Platform Fee
                      </p>
                      <p className="mt-1 font-black">
                        {formatMoney(order.platform_fee_amount)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                        Buyer Total
                      </p>
                      <p className="mt-1 font-black">
                        {formatMoney(order.total_amount)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                        Shipped
                      </p>
                      <p className="mt-1 font-black">
                        {formatDate(order.shipped_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-stone-300 bg-white p-4 text-sm font-bold leading-6 text-stone-700">
                    <p className="font-black text-stone-950">
                      Shipment submitted by seller
                    </p>
                    <p className="mt-2">
                      Carrier: {order.shipping_carrier || "Not provided"}
                    </p>
                    <p>Tracking: {order.tracking_number || "Not provided"}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => releaseSellerPayment(order)}
                      disabled={releasingOrderId === order.id}
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {releasingOrderId === order.id
                        ? "Releasing..."
                        : "Release Seller Payment"}
                    </button>

                    <Link
                      href={`/listing/${order.listing_id}`}
                      className="rounded-xl border border-stone-400 bg-white px-4 py-3 text-center text-sm font-black hover:bg-stone-100"
                    >
                      View Listing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
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
                <option value="pending">Pending only</option>
                <option value="active">Active only</option>
                <option value="denied">Denied only</option>
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
            Listings without photos: {listingsWithoutPhotos.length}. Listings
            with photos: {listingsWithPhotos.length}.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-black">All listings</h3>
              <p className="text-stone-600">
                Pending listings can be approved or denied. Active listings can
                be removed from Browse. Inactive and denied listings can be
                deleted forever.
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
                {filteredListings.map((listing) => {
                  const isEditingThisListing = editingListingId === listing.id;

                  return (
                    <div
                      key={listing.id}
                      className="grid gap-4 px-4 py-5 md:grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr_0.7fr_0.8fr] md:items-center"
                    >
                      {isEditingThisListing && editForm ? (
                        <div className="md:col-span-6">
                          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div>
                                <h4 className="text-xl font-black">
                                  Edit Listing
                                </h4>
                                <p className="text-sm font-bold text-stone-600">
                                  Update the listing details, then save.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={cancelEditingListing}
                                className="rounded-xl border border-stone-400 bg-white px-4 py-2 text-sm font-black hover:bg-stone-100"
                                disabled={isSavingEdit}
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(event) =>
                                    updateEditForm("title", event.target.value)
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Price
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editForm.price}
                                  onChange={(event) =>
                                    updateEditForm("price", event.target.value)
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Category
                                </label>
                                <input
                                  type="text"
                                  value={editForm.category}
                                  onChange={(event) =>
                                    updateEditForm(
                                      "category",
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Condition
                                </label>
                                <input
                                  type="text"
                                  value={editForm.condition}
                                  onChange={(event) =>
                                    updateEditForm(
                                      "condition",
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Brand
                                </label>
                                <input
                                  type="text"
                                  value={editForm.brand}
                                  onChange={(event) =>
                                    updateEditForm("brand", event.target.value)
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Model
                                </label>
                                <input
                                  type="text"
                                  value={editForm.model}
                                  onChange={(event) =>
                                    updateEditForm("model", event.target.value)
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Seller Name
                                </label>
                                <input
                                  type="text"
                                  value={editForm.seller_name}
                                  onChange={(event) =>
                                    updateEditForm(
                                      "seller_name",
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Seller Email
                                </label>
                                <input
                                  type="email"
                                  value={editForm.seller_email}
                                  onChange={(event) =>
                                    updateEditForm(
                                      "seller_email",
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(event) =>
                                    updateEditForm(
                                      "location",
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Status
                                </label>
                                <select
                                  value={editForm.status}
                                  onChange={(event) =>
                                    updateEditForm("status", event.target.value)
                                  }
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="denied">Denied</option>
                                </select>
                              </div>

                              <div className="md:col-span-2">
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Denial Reason
                                </label>
                                <textarea
                                  value={editForm.denial_reason}
                                  onChange={(event) =>
                                    updateEditForm(
                                      "denial_reason",
                                      event.target.value
                                    )
                                  }
                                  rows={3}
                                  placeholder="Only needed if status is denied."
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="text-sm font-black uppercase tracking-[0.14em] text-stone-700">
                                  Description
                                </label>
                                <textarea
                                  value={editForm.description}
                                  onChange={(event) =>
                                    updateEditForm(
                                      "description",
                                      event.target.value
                                    )
                                  }
                                  rows={4}
                                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                                />
                              </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => saveListingEdits(listing.id)}
                                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isSavingEdit}
                              >
                                {isSavingEdit ? "Saving..." : "Save Changes"}
                              </button>

                              <button
                                type="button"
                                onClick={cancelEditingListing}
                                className="rounded-xl border border-stone-400 bg-white px-5 py-3 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isSavingEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-lg font-black">
                              {listing.title}
                            </p>

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

                            {listing.status === "denied" &&
                            listing.denial_reason ? (
                              <p className="mt-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800">
                                Denial reason: {listing.denial_reason}
                              </p>
                            ) : null}
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
                              className={`inline-block rounded-full px-3 py-1 text-xs font-black ${getStatusBadgeClasses(
                                listing.status
                              )}`}
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
                            <button
                              type="button"
                              onClick={() => startEditingListing(listing)}
                              className="rounded-xl border border-stone-400 px-4 py-2 text-center text-sm font-black hover:bg-stone-100"
                            >
                              Edit
                            </button>

                            {listing.status === "pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    approveListing(listing.id, listing.title)
                                  }
                                  className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-black text-white hover:bg-emerald-500"
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    denyListing(listing.id, listing.title)
                                  }
                                  className="rounded-xl border border-red-300 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50"
                                >
                                  Deny
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteListingForever(
                                      listing.id,
                                      listing.title
                                    )
                                  }
                                  className="rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-sm font-black text-red-800 hover:bg-red-100"
                                >
                                  Delete Forever
                                </button>
                              </>
                            ) : null}

                            {listing.status === "active" ? (
                              <>
                                <Link
                                  href={`/listing/${listing.id}`}
                                  className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-black text-white hover:bg-emerald-500"
                                >
                                  View
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    markListingInactive(
                                      listing.id,
                                      listing.title
                                    )
                                  }
                                  className="rounded-xl border border-red-300 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </>
                            ) : null}

                            {listing.status === "inactive" ? (
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
                                    deleteListingForever(
                                      listing.id,
                                      listing.title
                                    )
                                  }
                                  className="rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-sm font-black text-red-800 hover:bg-red-100"
                                >
                                  Delete Forever
                                </button>
                              </>
                            ) : null}

                            {listing.status === "denied" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    approveListing(listing.id, listing.title)
                                  }
                                  className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-black text-white hover:bg-emerald-500"
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteListingForever(
                                      listing.id,
                                      listing.title
                                    )
                                  }
                                  className="rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-sm font-black text-red-800 hover:bg-red-100"
                                >
                                  Delete Forever
                                </button>
                              </>
                            ) : null}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 rounded-3xl bg-stone-950 p-6 text-white">
          <h3 className="text-2xl font-black">Admin note</h3>
          <p className="mt-3 max-w-4xl leading-8 text-stone-300">
            Pending listings do not appear on Browse until approved. Denied
            listings keep a denial reason so you can later message the seller
            with what needs to be fixed.
          </p>
        </div>
      </section>
    </main>
  );
}