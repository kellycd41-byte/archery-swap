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
};

type ListingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
          </nav>

          <Link
            href="/sell"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
          >
            Sell Your Gear
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/browse"
          className="text-sm font-black text-emerald-800 hover:text-emerald-600"
        >
          ← Back to Browse Gear
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="rounded-3xl border border-stone-300 bg-white p-4 shadow-sm">
              <div className="flex h-[420px] items-center justify-center rounded-2xl bg-gradient-to-br from-stone-300 to-emerald-900 px-6 text-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-white/80">
                    Photo Coming Soon
                  </p>
                  <p className="mt-3 text-sm font-bold text-white/70">
                    Real photo uploads will be added later.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-300 to-emerald-900 text-xs font-black uppercase tracking-[0.15em] text-white/70">
                Photo
              </div>
              <div className="h-24 rounded-2xl bg-stone-300" />
              <div className="h-24 rounded-2xl bg-stone-400" />
              <div className="h-24 rounded-2xl bg-stone-500" />
            </div>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
              {item.category}
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              {item.title}
            </h2>

            <p className="mt-3 text-stone-600">
              {item.condition}
              {item.location ? ` • ${item.location}` : ""}
            </p>

            <p className="mt-6 text-5xl font-black">
              ${Number(item.price).toLocaleString()}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500">
                Buy Now
              </button>

              <Link
                href="/messages"
                className="rounded-xl border border-stone-400 px-6 py-3 text-center font-black text-stone-950 hover:bg-stone-100"
              >
                Message Seller
              </Link>
            </div>

            <div className="mt-8 rounded-2xl bg-stone-100 p-5">
              <h3 className="font-black">Seller</h3>
              <p className="mt-2 font-bold">
                {item.seller_name || "Archery Swap Seller"}
              </p>
              <p className="text-sm text-stone-600">
                Seller profiles, ratings, and sales history will be added later.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-black">Item details</h3>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Condition</span>
                  <span className="font-black">{item.condition}</span>
                </div>

                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Category</span>
                  <span className="font-black">{item.category}</span>
                </div>

                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Location</span>
                  <span className="font-black">
                    {item.location || "Not listed"}
                  </span>
                </div>

                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Shipping</span>
                  <span className="font-black">Coming later</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black">Description</h3>

          <p className="mt-4 max-w-4xl whitespace-pre-line leading-8 text-stone-700">
            {item.description}
          </p>
        </section>

        <section className="mt-8 rounded-3xl bg-stone-950 p-6 text-white">
          <h3 className="text-2xl font-black">Buyer safety</h3>

          <ul className="mt-4 space-y-2 text-stone-300">
            <li>• Review photos and description before buying.</li>
            <li>• Ask questions if specs are missing.</li>
            <li>• Keep all messages and payments on Archery Swap.</li>
            <li>• Report suspicious listings to the admin team.</li>
          </ul>
        </section>
      </section>
    </main>
  );
}