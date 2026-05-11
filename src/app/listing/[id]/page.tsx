import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ListingPhotoGallery from "./ListingPhotoGallery";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
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
};

type ListingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function Header() {
  return (
    <header className="border-b border-stone-800 bg-stone-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              Archery Swap
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300 sm:text-xs">
              Buy • Sell • Archery Gear
            </p>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold md:flex">
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
          </nav>

          <div className="hidden md:block">
            <Link
              href="/sell"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
            >
              Sell Your Gear
            </Link>
          </div>

          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-xl border border-stone-700 px-4 py-2 text-sm font-black text-white">
              Menu
            </summary>

            <div className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-2xl border border-stone-700 bg-stone-900 shadow-2xl">
              <Link
                href="/"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Home
              </Link>
              <Link
                href="/browse"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Browse Gear
              </Link>
              <Link
                href="/sell"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Sell Gear
              </Link>
              <Link
                href="/messages"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Messages
              </Link>
              <Link
                href="/account"
                className="block px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Account
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

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

function buildEmailLink(item: Listing) {
  if (!item.seller_email || !item.seller_email.trim()) {
    return "";
  }

  const subject = encodeURIComponent(`Question about ${item.title}`);
  const body = encodeURIComponent(
    `Hi, I saw your listing on Archery Swap and wanted to ask about "${item.title}".`
  );

  return `mailto:${item.seller_email.trim()}?subject=${subject}&body=${body}`;
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !listing) {
    notFound();
  }

  const item = listing as Listing;
  const photos = buildPhotoList(item);
  const postedDate = formatPostedDate(item.created_at);
  const sellerEmailLink = buildEmailLink(item);

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

        <div className="mt-6 grid gap-8 md:grid-cols-[520px_minmax(0,1fr)] md:items-start">
          <section>
            <div className="rounded-3xl border border-stone-300 bg-white p-4 shadow-sm">
              <ListingPhotoGallery photos={photos} title={item.title} />
            </div>

            <div className="mt-5 rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
              <h3 className="font-black">Listing notes</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
                <li>• This listing has been reviewed before appearing publicly.</li>
                <li>• Review all photos, specs, and description before buying.</li>
                <li>• Contact the seller directly with questions before making arrangements.</li>
              </ul>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-900">
                Approved Listing
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
                {item.shipping_available ? "Shipping Available" : "Local Only"}
              </span>
            </div>

            <p className="mt-6 text-4xl font-black sm:text-5xl">
              ${Number(item.price).toLocaleString()}
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-lg font-black text-emerald-950">
                Contact seller
              </h3>

              <p className="mt-2 text-sm font-bold leading-6 text-emerald-900">
                Archery Swap messaging and checkout are still coming soon. For
                now, approved listings can be handled by contacting the seller
                directly.
              </p>

              {item.seller_email ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                  <p className="text-sm font-black text-emerald-950">
                    Seller contact is available for this listing.
                  </p>

                  <p className="mt-2 text-xs font-bold leading-5 text-stone-500">
                    Use the Email Seller button below to open your email app with
                    a starter message. The seller email is not displayed
                    directly on the page.
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-950">
                    Seller contact is not available for this listing yet.
                  </p>
                </div>
              )}

              <div className="mt-5 grid gap-3">
                {item.seller_email ? (
                  <a
                    href={sellerEmailLink}
                    className="rounded-xl bg-emerald-700 px-6 py-3 text-center font-black text-white hover:bg-emerald-600"
                  >
                    Email Seller
                  </a>
                ) : null}

                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-xl border border-emerald-700 bg-white px-6 py-3 text-center font-black text-emerald-950 opacity-80"
                >
                  Save Listing — Coming Soon
                </button>

                <Link
                  href="/browse"
                  className="rounded-xl border border-stone-400 px-6 py-3 text-center font-black text-stone-950 hover:bg-stone-100"
                >
                  Keep Browsing
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-stone-100 p-5">
              <h3 className="font-black">Seller</h3>

              <p className="mt-2 font-bold">
                {item.seller_name || "Archery Swap Seller"}
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-600">
                Seller profiles, ratings, checkout, messaging, and shipping
                tools will be added later. Use caution with payment, pickup, and
                shipping arrangements.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-black">Item details</h3>

              <div className="mt-4 grid gap-3 text-sm">
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
                  <span className="font-bold text-stone-600">Location</span>
                  <span className="text-right font-black">
                    {item.location || "Not listed"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Shipping</span>
                  <span className="text-right font-black">
                    {item.shipping_available ? "Available" : "Local only"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Posted</span>
                  <span className="text-right font-black">{postedDate}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {item.included_accessories ? (
          <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-2xl font-black">Included accessories</h3>

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

        <section className="mt-8 rounded-3xl bg-stone-950 p-5 text-white sm:p-6">
          <h3 className="text-2xl font-black">Buyer safety</h3>

          <ul className="mt-4 space-y-2 text-stone-300">
            <li>• Review photos, specs, price, and description carefully.</li>
            <li>• Ask the seller questions if anything is unclear.</li>
            <li>• Be careful with payment, pickup, or shipping arrangements.</li>
            <li>• Do not send payment outside a method you trust.</li>
            <li>• Report suspicious listings to the Archery Swap team.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}