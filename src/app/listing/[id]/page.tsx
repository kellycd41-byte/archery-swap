import Link from "next/link";
import { notFound } from "next/navigation";
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

function DetailPhotoPlaceholder() {
  return (
    <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-950 via-stone-800 to-emerald-950 px-6 text-center sm:h-[420px]">
      <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-emerald-300/20" />
      <div className="absolute bottom-8 right-8 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />

      <div className="relative max-w-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/40 bg-white/10 text-4xl">
          🎯
        </div>

        <p className="mt-5 text-sm font-black uppercase tracking-[0.3em] text-emerald-200">
          No Photo Added
        </p>

        <p className="mt-3 text-sm font-bold leading-6 text-white/70">
          This listing does not have a photo yet. Message the seller to request
          clear pictures before buying.
        </p>
      </div>
    </div>
  );
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

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="rounded-3xl border border-stone-300 bg-white p-4 shadow-sm">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-[320px] w-full rounded-2xl object-cover sm:h-[420px]"
                />
              ) : (
                <DetailPhotoPlaceholder />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
              {item.category}
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {item.title}
            </h2>

            <p className="mt-3 text-stone-600">
              {item.condition}
              {item.location ? ` • ${item.location}` : ""}
            </p>

            <p className="mt-6 text-4xl font-black sm:text-5xl">
              ${Number(item.price).toLocaleString()}
            </p>

            <div className="mt-6 grid gap-3">
              <Link
                href="/messages"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-center font-black text-white hover:bg-emerald-500"
              >
                Message Seller
              </Link>

              <Link
                href="/browse"
                className="rounded-xl border border-stone-400 px-6 py-3 text-center font-black text-stone-950 hover:bg-stone-100"
              >
                Keep Browsing
              </Link>
            </div>

            <div className="mt-6 rounded-2xl bg-stone-100 p-5">
              <h3 className="font-black">Seller</h3>
              <p className="mt-2 font-bold">
                {item.seller_name || "Archery Swap Seller"}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Seller profiles, ratings, checkout, and shipping tools will be
                added later.
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
                    {item.shipping_available ? "Available" : "Not available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
            <li>• Review photos and description before buying.</li>
            <li>• Ask questions if specs are missing.</li>
            <li>• Be careful with payment or shipping arrangements.</li>
            <li>• Report suspicious listings to the Archery Swap team.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
