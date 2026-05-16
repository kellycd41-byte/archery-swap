"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type OrderListing = {
  id: string;
  title: string;
  status: string;
};

type UserOrder = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  item_amount: number;
  shipping_amount: number;
  platform_fee_amount: number;
  total_amount: number;
  status: string;
  transfer_status: string | null;
  shipping_carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  ship_by_date: string | null;
  paid_at: string | null;
  created_at: string;
  listing: OrderListing | OrderListing[] | null;
};

type SellerReview = {
  id: string;
  order_id: string;
  listing_id: string;
  seller_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type AccountOrdersBoxProps = {
  user: User;
};

function formatMoney(value: number) {
  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatOrderDate(dateValue: string | null) {
  if (!dateValue) {
    return "Not paid yet";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function orderStatusLabel(
  order: UserOrder,
  kind: "bought" | "sold"
) {
  if (order.transfer_status === "released") {
    return kind === "sold" ? "Seller Paid" : "Order Complete";
  }

  if (order.status === "paid") {
    return kind === "sold"
      ? "Paid — Ship This Order"
      : "Paid — Waiting for Seller to Ship";
  }

  if (order.status === "shipped") {
    return kind === "sold"
      ? "Shipped — Waiting for Payout Review"
      : "Shipped — Tracking Submitted";
  }

  if (order.status === "pending") {
    return "Pending";
  }

  if (order.status === "cancelled") {
    return "Cancelled";
  }

  return order.status || "Unknown";
}

function orderStatusClassName(status: string) {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "shipped") {
    return "bg-blue-100 text-blue-900";
  }

  if (status === "pending") {
    return "bg-amber-100 text-amber-900";
  }

  return "bg-stone-200 text-stone-800";
}

function getOrderListing(order: UserOrder) {
  if (Array.isArray(order.listing)) {
    return order.listing[0] || null;
  }

  return order.listing;
}

export default function AccountOrdersBox({ user }: AccountOrdersBoxProps) {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"bought" | "sold" | null>(
    null
  );
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersErrorMessage, setOrdersErrorMessage] = useState("");
  const [shippingCarrierByOrderId, setShippingCarrierByOrderId] = useState<
    Record<string, string>
  >({});
  const [trackingNumberByOrderId, setTrackingNumberByOrderId] = useState<
    Record<string, string>
  >({});
  const [updatingShippingOrderId, setUpdatingShippingOrderId] = useState<
    string | null
  >(null);
  const [shippingActionMessage, setShippingActionMessage] = useState("");
  const [shippingActionErrorMessage, setShippingActionErrorMessage] =
    useState("");
  const [reviewsByOrderId, setReviewsByOrderId] = useState<
    Record<string, SellerReview>
  >({});
  const [reviewRatingByOrderId, setReviewRatingByOrderId] = useState<
    Record<string, string>
  >({});
  const [reviewCommentByOrderId, setReviewCommentByOrderId] = useState<
    Record<string, string>
  >({});
  const [savingReviewOrderId, setSavingReviewOrderId] = useState<string | null>(
    null
  );
  const [reviewActionMessage, setReviewActionMessage] = useState("");
  const [reviewActionErrorMessage, setReviewActionErrorMessage] = useState("");

  const boughtOrders = orders.filter((order) => order.buyer_id === user.id);
  const soldOrders = orders.filter((order) => order.seller_id === user.id);
  const sellerOrdersNeedingShipment = soldOrders.filter(
    (order) =>
      order.status === "paid" &&
      order.transfer_status === "not_released" &&
      !order.shipped_at
  );
  const hasSellerOrdersNeedingShipment =
    sellerOrdersNeedingShipment.length > 0;

  async function loadReviewsForOrders(userOrders: UserOrder[]) {
    const boughtOrderIds = userOrders
      .filter((order) => order.buyer_id === user.id)
      .map((order) => order.id);

    if (boughtOrderIds.length === 0) {
      setReviewsByOrderId({});
      return;
    }

    const { data, error } = await supabase
      .from("seller_reviews")
      .select("id,order_id,listing_id,seller_id,buyer_id,rating,comment,created_at")
      .eq("buyer_id", user.id)
      .in("order_id", boughtOrderIds);

    if (error) {
      setReviewActionErrorMessage(error.message);
      setReviewsByOrderId({});
      return;
    }

    const nextReviewsByOrderId: Record<string, SellerReview> = {};

    ((data || []) as SellerReview[]).forEach((review) => {
      nextReviewsByOrderId[review.order_id] = review;
    });

    setReviewsByOrderId(nextReviewsByOrderId);
  }

  async function loadOrders() {
    setIsLoadingOrders(true);
    setOrdersErrorMessage("");
    setReviewActionErrorMessage("");

    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,listing_id,buyer_id,seller_id,item_amount,shipping_amount,platform_fee_amount,total_amount,status,transfer_status,shipping_carrier,tracking_number,shipped_at,ship_by_date,paid_at,created_at,listing:listings(id,title,status)"
      )
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .in("status", ["paid", "shipped"])
      .order("created_at", { ascending: false });

    setIsLoadingOrders(false);

    if (error) {
      setOrdersErrorMessage(error.message);
      setOrders([]);
      setReviewsByOrderId({});
      return;
    }

    const nextOrders = (data || []) as UserOrder[];

    setOrders(nextOrders);
    await loadReviewsForOrders(nextOrders);
  }

  useEffect(() => {
    loadOrders();
  }, [user.id]);

  async function handleSubmitReview(
    event: FormEvent<HTMLFormElement>,
    order: UserOrder
  ) {
    event.preventDefault();

    setReviewActionMessage("");
    setReviewActionErrorMessage("");

    const ratingValue = Number(reviewRatingByOrderId[order.id] || "5");
    const commentValue = (reviewCommentByOrderId[order.id] || "").trim();

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setReviewActionErrorMessage("Please choose a rating from 1 to 5.");
      return;
    }

    if (order.transfer_status !== "released") {
      setReviewActionErrorMessage(
        "You can leave a review after the order is complete."
      );
      return;
    }

    setSavingReviewOrderId(order.id);

    const { data, error } = await supabase
      .from("seller_reviews")
      .insert({
        order_id: order.id,
        listing_id: order.listing_id,
        seller_id: order.seller_id,
        buyer_id: user.id,
        rating: ratingValue,
        comment: commentValue || null,
      })
      .select("id,order_id,listing_id,seller_id,buyer_id,rating,comment,created_at")
      .single();

    if (error) {
      setReviewActionErrorMessage(error.message);
      setSavingReviewOrderId(null);
      return;
    }

    const newReview = data as SellerReview;

    setReviewsByOrderId((currentReviews) => ({
      ...currentReviews,
      [newReview.order_id]: newReview,
    }));
    setReviewRatingByOrderId((currentValues) => ({
      ...currentValues,
      [order.id]: "5",
    }));
    setReviewCommentByOrderId((currentValues) => ({
      ...currentValues,
      [order.id]: "",
    }));
    setReviewActionMessage("Review saved. Thank you for helping other buyers.");
    setSavingReviewOrderId(null);
  }

  async function handleMarkShipped(
    event: FormEvent<HTMLFormElement>,
    order: UserOrder
  ) {
    event.preventDefault();

    setShippingActionMessage("");
    setShippingActionErrorMessage("");

    const shippingCarrier = (shippingCarrierByOrderId[order.id] || "").trim();
    const trackingNumber = (trackingNumberByOrderId[order.id] || "").trim();

    if (!shippingCarrier) {
      setShippingActionErrorMessage("Please enter the shipping carrier.");
      return;
    }

    if (!trackingNumber) {
      setShippingActionErrorMessage("Please enter the tracking number.");
      return;
    }

    const confirmed = window.confirm(
      "Mark this order shipped? Seller payment will still stay held until shipment is reviewed and released."
    );

    if (!confirmed) {
      return;
    }

    setUpdatingShippingOrderId(order.id);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setShippingActionErrorMessage(
          "Please sign in again before updating this order."
        );
        setUpdatingShippingOrderId(null);
        return;
      }

      const response = await fetch("/api/orders/mark-shipped", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          shippingCarrier,
          trackingNumber,
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setShippingActionErrorMessage(
          result.error || "This order could not be marked shipped."
        );
        setUpdatingShippingOrderId(null);
        return;
      }

      setShippingActionMessage(
        "Order marked shipped. Seller payout is still held until shipment is reviewed."
      );
      setShippingCarrierByOrderId((currentValues) => ({
        ...currentValues,
        [order.id]: "",
      }));
      setTrackingNumberByOrderId((currentValues) => ({
        ...currentValues,
        [order.id]: "",
      }));

      await loadOrders();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while marking this order shipped.";

      setShippingActionErrorMessage(message);
    }

    setUpdatingShippingOrderId(null);
  }

  function renderOrderCard(order: UserOrder, kind: "bought" | "sold") {
    const listing = getOrderListing(order);
    const listingTitle = listing?.title || "Listing unavailable";
    const needsShipment =
      kind === "sold" &&
      order.status === "paid" &&
      order.transfer_status === "not_released" &&
      !order.shipped_at;
    const hasTracking =
      Boolean(order.shipping_carrier) || Boolean(order.tracking_number);
    const existingReview = reviewsByOrderId[order.id];
    const canReviewSeller =
      kind === "bought" &&
      order.transfer_status === "released" &&
      !existingReview;

    return (
      <div
        key={order.id}
        className="overflow-hidden rounded-2xl border border-stone-300 bg-white"
      >
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-black">{listingTitle}</h4>

              <p className="mt-1 text-sm font-bold text-stone-500">
                {kind === "bought" ? "Bought" : "Sold"}{" "}
                {formatOrderDate(order.paid_at || order.created_at)}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${orderStatusClassName(
                order.status
              )}`}
            >
              {orderStatusLabel(order, kind)}
            </span>
          </div>

          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-stone-100 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                Item
              </p>
              <p className="mt-1 font-black">
                {formatMoney(order.item_amount)}
              </p>
            </div>

            <div className="rounded-xl bg-stone-100 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                Shipping
              </p>
              <p className="mt-1 font-black">
                {formatMoney(order.shipping_amount)}
              </p>
            </div>

            <div className="rounded-xl bg-stone-100 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                Total
              </p>
              <p className="mt-1 font-black">
                {formatMoney(order.total_amount)}
              </p>
            </div>

            <div className="rounded-xl bg-stone-100 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">
                Fee
              </p>
              <p className="mt-1 font-black">
                {kind === "sold"
                  ? formatMoney(order.platform_fee_amount)
                  : "Seller paid"}
              </p>
            </div>
          </div>

          {kind === "bought" ? (
            <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm font-bold leading-6 text-stone-700">
              {hasTracking ? (
                <>
                  <p className="font-black text-stone-950">
                    Shipment information
                  </p>
                  <p className="mt-2">
                    Carrier: {order.shipping_carrier || "Not provided"}
                  </p>
                  <p>Tracking: {order.tracking_number || "Not provided"}</p>
                </>
              ) : (
                <p>Seller is preparing shipment.</p>
              )}
            </div>
          ) : null}

          {kind === "sold" && needsShipment ? (
            <form
              onSubmit={(event) => handleMarkShipped(event, order)}
              className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
            >
              <p className="text-sm font-black text-emerald-950">
                Shipment needed
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-emerald-900">
                Add carrier and tracking. Seller payout will stay held until the
                shipment is reviewed and released.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-emerald-950">
                    Carrier
                  </span>
                  <input
                    type="text"
                    value={shippingCarrierByOrderId[order.id] || ""}
                    onChange={(event) =>
                      setShippingCarrierByOrderId((currentValues) => ({
                        ...currentValues,
                        [order.id]: event.target.value,
                      }))
                    }
                    placeholder="USPS, UPS, FedEx..."
                    className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-emerald-950">
                    Tracking Number
                  </span>
                  <input
                    type="text"
                    value={trackingNumberByOrderId[order.id] || ""}
                    onChange={(event) =>
                      setTrackingNumberByOrderId((currentValues) => ({
                        ...currentValues,
                        [order.id]: event.target.value,
                      }))
                    }
                    placeholder="Enter tracking number"
                    className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-600"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={updatingShippingOrderId === order.id}
                className="mt-4 cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingShippingOrderId === order.id
                  ? "Saving..."
                  : "Mark Shipped"}
              </button>
            </form>
          ) : null}

          {kind === "sold" && !needsShipment && hasTracking ? (
            <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm font-bold leading-6 text-stone-700">
              <p className="font-black text-stone-950">Shipment submitted</p>
              <p className="mt-2">
                Carrier: {order.shipping_carrier || "Not provided"}
              </p>
              <p>Tracking: {order.tracking_number || "Not provided"}</p>
              <p className="mt-2 text-stone-600">
                Seller payout is still held until shipment is reviewed.
              </p>
            </div>
          ) : null}

          {kind === "bought" && existingReview ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-950">
              <p className="font-black">Your seller review</p>
              <p className="mt-2">Rating: {existingReview.rating} / 5</p>
              {existingReview.comment ? (
                <p className="mt-1 text-emerald-900">
                  “{existingReview.comment}”
                </p>
              ) : null}
            </div>
          ) : null}

          {canReviewSeller ? (
            <form
              onSubmit={(event) => handleSubmitReview(event, order)}
              className="mt-4 rounded-2xl border border-stone-300 bg-stone-50 p-4"
            >
              <div className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                      Seller Review
                    </p>
                    <h5 className="mt-1 text-base font-black text-stone-950">
                      Leave a review
                    </h5>
                    <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-stone-600">
                      This order is complete. Rate your buying experience to help
                      other Archery Outlet buyers.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid items-start gap-4 sm:grid-cols-[180px_1fr]">
                  <label className="block">
                    <span className="text-sm font-black text-stone-950">
                      Rating
                    </span>
                    <select
                      value={reviewRatingByOrderId[order.id] || "5"}
                      onChange={(event) =>
                        setReviewRatingByOrderId((currentValues) => ({
                          ...currentValues,
                          [order.id]: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-stone-700"
                    >
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-black text-stone-950">
                      Comment
                    </span>
                    <textarea
                      value={reviewCommentByOrderId[order.id] || ""}
                      onChange={(event) =>
                        setReviewCommentByOrderId((currentValues) => ({
                          ...currentValues,
                          [order.id]: event.target.value,
                        }))
                      }
                      placeholder="Example: Fast shipping and the bow matched the description."
                      rows={3}
                      className="mt-2 min-h-24 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-stone-700"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingReviewOrderId === order.id}
                    className="w-full cursor-pointer rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {savingReviewOrderId === order.id
                      ? "Saving..."
                      : "Save Review"}
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
            {listing ? (
              <Link
                href={`/listing/${order.listing_id}`}
                className="rounded-xl bg-stone-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-stone-800"
              >
                View Listing
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
      <button
        type="button"
        onClick={() => {
          setIsOpen((currentValue) => !currentValue);

          if (isOpen) {
            setActivePanel(null);
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-stone-300 bg-stone-50 px-5 py-4 text-left hover:bg-stone-100"
      >
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black">My Orders</h3>

            {hasSellerOrdersNeedingShipment ? (
              <span
                className="h-3 w-3 rounded-full bg-emerald-500"
                title="You have paid orders to ship"
              />
            ) : null}
          </div>

          <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
            View gear you bought and orders from gear you sold.
          </p>
        </div>

        <span className="rounded-full bg-stone-950 px-3 py-1 text-sm font-black text-white">
          {isOpen ? "Close" : "Open"}
        </span>
      </button>

      {isOpen ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setActivePanel((currentValue) =>
                    currentValue === "bought" ? null : "bought"
                  )
                }
                className={`cursor-pointer rounded-2xl px-5 py-4 text-left font-black ${
                  activePanel === "bought"
                    ? "bg-stone-950 text-white"
                    : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                }`}
              >
                Orders I Bought
                <span className="ml-2 rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-900">
                  {boughtOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActivePanel((currentValue) =>
                    currentValue === "sold" ? null : "sold"
                  )
                }
                className={`cursor-pointer rounded-2xl px-5 py-4 text-left font-black ${
                  activePanel === "sold"
                    ? "bg-stone-950 text-white"
                    : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  Orders I Sold
                  {hasSellerOrdersNeedingShipment ? (
                    <span
                      className="h-3 w-3 rounded-full bg-emerald-500"
                      title="Paid orders need shipping"
                    />
                  ) : null}
                </span>
                <span className="ml-2 rounded-full bg-stone-200 px-2 py-1 text-xs text-stone-900">
                  {soldOrders.length}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={isLoadingOrders}
              className="w-full cursor-pointer rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isLoadingOrders ? "Refreshing..." : "Refresh Orders"}
            </button>
          </div>

          {hasSellerOrdersNeedingShipment ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>
                  You have {sellerOrdersNeedingShipment.length} paid order
                  {sellerOrdersNeedingShipment.length === 1 ? "" : "s"} to ship.
                </span>
              </div>
            </div>
          ) : null}

          {shippingActionMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              {shippingActionMessage}
            </div>
          ) : null}

          {shippingActionErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {shippingActionErrorMessage}
            </div>
          ) : null}

          {reviewActionMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              {reviewActionMessage}
            </div>
          ) : null}

          {reviewActionErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {reviewActionErrorMessage}
            </div>
          ) : null}

          {ordersErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {ordersErrorMessage}
            </div>
          ) : null}

          {isLoadingOrders ? (
            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="font-bold text-stone-700">
                Loading your orders...
              </p>
            </div>
          ) : null}

          {!isLoadingOrders && activePanel === "bought" ? (
            <div className="mt-5 rounded-3xl border border-stone-300 bg-stone-50 p-4 sm:p-5">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                  Buying
                </p>
                <h4 className="mt-1 text-xl font-black">Orders I Bought</h4>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Completed Buy Now orders will appear here.
                </p>
              </div>

              {boughtOrders.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-stone-300 bg-white p-5">
                  <p className="font-black">No bought orders yet.</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    When you buy gear through checkout, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  {boughtOrders.map((order) =>
                    renderOrderCard(order, "bought")
                  )}
                </div>
              )}
            </div>
          ) : null}

          {!isLoadingOrders && activePanel === "sold" ? (
            <div className="mt-5 rounded-3xl border border-stone-300 bg-stone-50 p-4 sm:p-5">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                    Selling
                  </p>

                  {hasSellerOrdersNeedingShipment ? (
                    <span
                      className="h-3 w-3 rounded-full bg-emerald-500"
                      title="Paid orders need shipping"
                    />
                  ) : null}
                </div>
                <h4 className="mt-1 text-xl font-black">Orders I Sold</h4>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Paid orders from your sold listings will appear here. Orders
                  with a green dot need shipment details.
                </p>
              </div>

              {soldOrders.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-stone-300 bg-white p-5">
                  <p className="font-black">No sold orders yet.</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    When someone buys your gear through checkout, it will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  {soldOrders.map((order) => renderOrderCard(order, "sold"))}
                </div>
              )}
            </div>
          ) : null}

          {!isLoadingOrders && !activePanel ? (
            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="font-black">Choose an order list.</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Click Orders I Bought or Orders I Sold to open that list.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
