import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type SellerReviewsPageProps = {
  params: Promise<{
    sellerId: string;
  }>;
};

type SellerReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  listing_id: string;
  listing:
    | {
        id: string;
        title: string;
      }
    | {
        id: string;
        title: string;
      }[]
    | null;
};

function formatReviewDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
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

export default async function SellerReviewsPage({
  params,
}: SellerReviewsPageProps) {
  const { sellerId } = await params;

  const { data: sellerListing } = await supabase
    .from("listings")
    .select("seller_name")
    .eq("user_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: reviewData, error } = await supabase
    .from("seller_reviews")
    .select("id,rating,comment,created_at,listing_id,listing:listings(id,title)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    notFound();
  }

  const reviews = (reviewData || []) as SellerReview[];
  const sellerName =
    sellerListing?.seller_name || "Archery Outlet Seller";
  const sellerAverageRating = averageRating(reviews);

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/browse"
          className="text-sm font-black text-emerald-800 hover:text-emerald-600"
        >
          ← Back to Browse Gear
        </Link>

        <div className="mt-6 rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
            Seller Reviews
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {sellerName}
          </h1>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                Rating
              </p>
              <p className="mt-1 text-2xl font-black">
                {formatRating(sellerAverageRating)}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                Reviews
              </p>
              <p className="mt-1 text-2xl font-black">
                {reviews.length}
              </p>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-stone-300 bg-white p-5 shadow-sm">
            <p className="font-black">No seller reviews yet.</p>
            <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
              Reviews will appear here after buyers complete orders and leave
              feedback.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {reviews.map((review) => {
              const listing = getReviewListing(review);

              return (
                <div
                  key={review.id}
                  className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm"
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
        )}
      </section>

      <Footer />
    </main>
  );
}
