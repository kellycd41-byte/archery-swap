import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import BuyNowBox from "./BuyNowBox";
import ListingPhotoGallery from "./ListingPhotoGallery";
import MakeOfferBox from "./MakeOfferBox";
import MessageSellerBox from "./MessageSellerBox";

type Listing = {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  price: number;
  shipping_cost: number | null;
  category: string;
  condition: string;
  location: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  seller_name: string | null;
  seller_email: string | null;
  status: string;
  created_at: string;
  brand: string | null;
  model: string | null;
  draw_weight: string | null;
  draw_length: string | null;
  handedness: string | null;
  included_accessories: string | null;
  shipping_available: boolean;
  offers_allowed: boolean | null;
};

type ListingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function detailValue(value: string | null | undefined) {
  return value && value.trim() ? value : "Not listed";
}

function buildPhotoList(item: Listing) {
  const photosFromArray = Array.isArray(item.image_urls)
    ? item.image_urls.filter((url) => url && url.trim())
    : [];

  if (photosFromArray.length > 0) {
    return photosFromArray;
  }

  if (item.image_url && item.image_url.trim()) {
    return [item.image_url];
  }

  return [];
}

function formatPostedDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value: number) {
  return `$${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const item = listing as Listing;

  if (item.status !== "active" && item.status !== "sold") {
    notFound();
  }

  const photos = buildPhotoList(item);
  const postedDate = formatPostedDate(item.created_at);
  const isSold = item.status === "sold";
  const offersAllowed = item.offers_allowed !== false && !isSold;
  const itemPrice = Number(item.price) || 0;
  const shippingCost = Number(item.shipping_cost) || 0;
  const totalBeforeCheckout = itemPrice + shippingCost;

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/browse"
          className="text-sm font-black text-emerald-800 hover:text-emerald-600"
        >
          ← Back to Browse Gear
        </Link>

        {isSold ? (
          <div className="mt-6 rounded-3xl border border-stone-800 bg-stone-950 p-5 text-white shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">
              Sold Listing
            </p>

            <h1 className="mt-3 text-2xl font-black">
              This item has been sold.
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300">
              This listing is hidden from Browse and is no longer accepting
              offers or messages. The page remains viewable from Account for
              seller records.
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-8 md:grid-cols-[520px_minmax(0,1fr)] md:items-start">
          <section>
            <div className="rounded-3xl border border-stone-300 bg-white p-4 shadow-sm">
              <ListingPhotoGallery photos={photos} title={item.title} />
            </div>

            <div className="mt-5 rounded-3xl border border-stone-300 bg-white p-5 shadow-sm">
              <h3 className="text-2xl font-black">Item Details</h3>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Status</span>
                  <span className="text-right font-black">
                    {isSold ? "Sold" : "Available"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Condition</span>
                  <span className="text-right font-black">{item.condition}</span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Category</span>
                  <span className="text-right font-black">{item.category}</span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Brand</span>
                  <span className="text-right font-black">
                    {detailValue(item.brand)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Model</span>
                  <span className="text-right font-black">
                    {detailValue(item.model)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Draw weight</span>
                  <span className="text-right font-black">
                    {detailValue(item.draw_weight)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Draw length</span>
                  <span className="text-right font-black">
                    {detailValue(item.draw_length)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Handedness</span>
                  <span className="text-right font-black">
                    {detailValue(item.handedness)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Accessories</span>
                  <span className="text-right font-black">
                    {item.included_accessories ? "Listed below" : "Not listed"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                  isSold
                    ? "bg-stone-950 text-white"
                    : "bg-emerald-100 text-emerald-900"
                }`}
              >
                {isSold ? "Sold Listing" : "Approved Listing"}
              </span>

              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-stone-700">
                {item.category}
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {item.title}
            </h2>

            <p className="mt-3 text-sm font-bold text-stone-500">
              Posted {postedDate}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-sm font-black text-stone-800">
                {item.condition}
              </span>

              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-sm font-black text-stone-800">
                {item.location || "Location not listed"}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-sm font-black ${
                  item.shipping_available
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-stone-300 bg-stone-50 text-stone-800"
                }`}
              >
                Shipping Required
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-sm font-black ${
                  isSold
                    ? "border-stone-800 bg-stone-950 text-white"
                    : offersAllowed
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-stone-300 bg-stone-50 text-stone-800"
                }`}
              >
                {isSold ? "Sold" : offersAllowed ? "Offers Welcome" : "No Offers"}
              </span>
            </div>

            <p className="mt-6 text-4xl font-black sm:text-5xl">
              {formatMoney(itemPrice)}
            </p>

            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <h3 className="text-xl font-black">Price Summary</h3>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Item price</span>
                  <span className="text-right font-black">
                    {formatMoney(itemPrice)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Shipping</span>
                  <span className="text-right font-black">
                    {shippingCost === 0 ? "Free" : formatMoney(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="font-bold text-stone-600">
                    Total before checkout
                  </span>
                  <span className="text-right font-black">
                    {formatMoney(totalBeforeCheckout)}
                  </span>
                </div>
              </div>
            </div>

            {isSold ? (
              <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-100 p-5">
                <h3 className="font-black">Sold item</h3>

                <p className="mt-2 text-sm font-bold leading-6 text-stone-700">
                  This item is no longer available. Buy Now, offers, and seller
                  messages are disabled for this listing.
                </p>

                <Link
                  href="/account"
                  className="mt-4 inline-block rounded-xl bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-stone-800"
                >
                  Back to Account
                </Link>
              </div>
            ) : (
              <>
                <BuyNowBox listingId={item.id} listingTitle={item.title} />

                {offersAllowed ? (
                  <MakeOfferBox
                    listingId={item.id}
                    listingTitle={item.title}
                    listingPrice={item.price}
                    sellerUserId={item.user_id}
                  />
                ) : (
                  <div className="mt-4 rounded-2xl border border-stone-300 bg-stone-50 p-4">
                    <h3 className="text-xl font-black">Offers Closed</h3>

                    <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
                      This seller is not accepting offers on this listing.
                    </p>
                  </div>
                )}

                <MessageSellerBox
                  listingId={item.id}
                  listingTitle={item.title}
                  sellerUserId={item.user_id}
                />
              </>
            )}

            <div className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <h3 className="text-xl font-black">Listing Details</h3>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Seller</span>
                  <span className="text-right font-black">
                    {item.seller_name || "Archery Outlet Seller"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Location</span>
                  <span className="text-right font-black">
                    {item.location || "Not listed"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Shipping</span>
                  <span className="text-right font-black">
                    {shippingCost === 0 ? "Free" : formatMoney(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Offers</span>
                  <span className="text-right font-black">
                    {isSold
                      ? "Closed"
                      : offersAllowed
                        ? "Allowed"
                        : "Not accepted"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Posted</span>
                  <span className="text-right font-black">{postedDate}</span>
                </div>
              </div>

              <p className="mt-4 text-sm font-bold leading-6 text-stone-600">
                Seller profiles, ratings, checkout, and shipping tools will be
                added later. Use caution with payment and shipping
                arrangements.
              </p>
            </div>
          </section>
        </div>

        {item.included_accessories ? (
          <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-2xl font-black">Included Accessories</h3>

            <p className="mt-4 max-w-4xl whitespace-pre-line leading-8 text-stone-700">
              {item.included_accessories}
            </p>
          </section>
        ) : null}

        <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-2xl font-black">Description</h3>

          <p className="mt-4 max-w-4xl whitespace-pre-line leading-8 text-stone-700">
            {item.description}
          </p>
        </section>

        {!isSold ? (
          <section className="mt-8 rounded-3xl bg-stone-950 p-5 text-white sm:p-6">
            <h3 className="text-2xl font-black">Buyer Safety</h3>

            <ul className="mt-4 space-y-2 text-stone-300">
              <li>• Review photos, specs, price, and description carefully.</li>
              <li>• Ask the seller questions if anything is unclear.</li>
              <li>• Be careful with payment and shipping arrangements.</li>
              <li>• Do not send payment outside a method you trust.</li>
              <li>• Report suspicious listings to the Archery Outlet team.</li>
            </ul>
          </section>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}