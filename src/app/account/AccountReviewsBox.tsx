"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ReviewListing = {
  id: string;
  title: string;
};

type SellerReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  listing_id: string;
  listing: ReviewListing | ReviewListing[] | null;
};

type AccountReviewsBoxProps = {
  user: User;
};

function formatReviewDate(dateValue: string) {
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

function getReviewListing(review: SellerReview) {
  if (Array.isArray(review.listing)) {
    return review.listing[0] || null;
  }

  return review.listing;
}

function averageRating(reviews: SellerReview[]) {
  if (reviews.length === 0) {
    return null;
  }

  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);

  return total / reviews.length;
}

function formatRating(value: number | null) {
  if (value === null) {
    return "No reviews yet";
  }

  return `${value.toFixed(1)} / 5`;
}

export default function AccountReviewsBox({ user }: AccountReviewsBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsErrorMessage, setReviewsErrorMessage] = useState("");

  const sellerAverageRating = averageRating(reviews);

  async function loadReviews() {
    setIsLoadingReviews(true);
    setReviewsErrorMessage("");

    const { data, error } = await supabase
      .from("seller_reviews")
      .select("id,rating,comment,created_at,listing_id,listing:listings(id,title)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    setIsLoadingReviews(false);

    if (error) {
      setReviewsErrorMessage(error.message);
      setReviews([]);
      return;
    }

    setReviews((data || []) as SellerReview[]);
  }

  useEffect(() => {
    loadReviews();
  }, [user.id]);

  return (
    <section className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-stone-300 bg-stone-50 px-5 py-4 text-left hover:bg-stone-100"
      >
        <div>
          <h3 className="text-2xl font-black">Reviews About Me</h3>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
            See reviews buyers left after completed orders.
          </p>
        </div>

        <span className="rounded-full bg-stone-950 px-3 py-1 text-sm font-black text-white">
          {isOpen ? "Close" : "Open"}
        </span>
      </button>

      {isOpen ? (
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                Seller Rating
              </p>
              <p className="mt-1 text-2xl font-black">
                {formatRating(sellerAverageRating)}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                Reviews
              </p>
              <p className="mt-1 text-2xl font-black">{reviews.length}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadReviews}
            disabled={isLoadingReviews}
            className="mt-4 w-full cursor-pointer rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-black hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isLoadingReviews ? "Refreshing..." : "Refresh Reviews"}
          </button>

          {reviewsErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {reviewsErrorMessage}
            </div>
          ) : null}

          {isLoadingReviews ? (
            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="font-bold text-stone-700">
                Loading your reviews...
              </p>
            </div>
          ) : null}

          {!isLoadingReviews && reviews.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="font-black">No reviews yet.</p>
              <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
                Reviews will appear here after buyers complete orders and leave
                feedback.
              </p>
            </div>
          ) : null}

          {!isLoadingReviews && reviews.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {reviews.map((review) => {
                const listing = getReviewListing(review);

                return (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-stone-300 bg-stone-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black">
                          {review.rating} / 5 stars
                        </p>

                        <p className="mt-1 text-sm font-bold text-stone-500">
                          {formatReviewDate(review.created_at)}
                        </p>
                      </div>

                      {listing ? (
                        <Link
                          href={`/listing/${listing.id}`}
                          className="rounded-xl bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-stone-800"
                        >
                          View Listing
                        </Link>
                      ) : null}
                    </div>

                    {listing ? (
                      <p className="mt-4 text-sm font-black text-stone-700">
                        Order item: {listing.title}
                      </p>
                    ) : null}

                    {review.comment ? (
                      <p className="mt-3 whitespace-pre-line text-sm font-bold leading-7 text-stone-700">
                        “{review.comment}”
                      </p>
                    ) : (
                      <p className="mt-3 text-sm font-bold leading-7 text-stone-600">
                        This buyer left a rating without a written comment.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
