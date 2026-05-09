import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categories = [
  "All",
  "Bows",
  "Crossbows",
  "Sights",
  "Releases",
  "Arrows",
  "Cases",
  "Targets",
  "Accessories",
];

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

export default async function BrowsePage() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

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
            <Link href="/browse" className="text-emerald-300">
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

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Browse Gear
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            Find bows, crossbows, sights, releases, arrows, and accessories.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Browse real listings saved to the Archery Swap database. Search,
            advanced filters, photos, user accounts, payments, and shipping will
            be added later.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black">Filters</h3>

            <div className="mt-5">
              <label className="text-sm font-black text-stone-700">
                Search
              </label>
              <input
                type="text"
                placeholder="Search gear..."
                disabled
                className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm outline-none"
              />
              <p className="mt-2 text-xs font-bold text-stone-500">
                Search will be connected later.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-stone-700">Category</p>

              <div className="mt-3 space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    disabled
                    className="block w-full rounded-xl border border-stone-300 px-4 py-2 text-left text-sm font-bold text-stone-700"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-stone-700">Condition</p>

              <div className="mt-3 space-y-2 text-sm font-bold">
                <label className="flex items-center gap-2 text-stone-500">
                  <input type="checkbox" disabled />
                  New
                </label>
                <label className="flex items-center gap-2 text-stone-500">
                  <input type="checkbox" disabled />
                  Excellent
                </label>
                <label className="flex items-center gap-2 text-stone-500">
                  <input type="checkbox" disabled />
                  Very Good
                </label>
                <label className="flex items-center gap-2 text-stone-500">
                  <input type="checkbox" disabled />
                  Good
                </label>
              </div>

              <p className="mt-3 text-xs font-bold text-stone-500">
                Filters will be connected later.
              </p>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-2xl font-black">Available Gear</h3>
                <p className="text-stone-600">
                  Showing real listings from Supabase.
                </p>
              </div>

              <select
                disabled
                className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-bold text-stone-500"
              >
                <option>Sort: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm font-bold text-red-800">
                Could not load listings: {error.message}
              </div>
            ) : null}

            {!error && (!listings || listings.length === 0) ? (
              <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center shadow-sm">
                <h4 className="text-2xl font-black">No listings yet</h4>
                <p className="mt-2 text-stone-600">
                  Be the first person to list archery gear on Archery Swap.
                </p>
                <Link
                  href="/sell"
                  className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-500"
                >
                  Sell Your Gear
                </Link>
              </div>
            ) : null}

            {!error && listings && listings.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {(listings as Listing[]).map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm"
                  >
                    <div className="flex h-48 items-center justify-center bg-gradient-to-br from-stone-300 to-emerald-900 px-5 text-center">
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-white/80">
                        Photo Coming Soon
                      </p>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                        {item.category}
                      </p>

                      <h4 className="mt-2 text-xl font-black">{item.title}</h4>

                      <p className="mt-2 text-sm font-bold text-stone-500">
                        {item.condition}
                        {item.location ? ` • ${item.location}` : ""}
                      </p>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                        {item.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <p className="text-2xl font-black">
                          ${Number(item.price).toLocaleString()}
                        </p>

                        <Link
                          href={`/listing/${item.id}`}
                          className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}