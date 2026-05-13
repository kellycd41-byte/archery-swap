import Link from "next/link";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

const categories = [
  "Bows",
  "Crossbows",
  "Sights",
  "Releases",
  "Arrows",
  "Cases",
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
  image_urls: string[] | null;
  status: string;
  created_at: string;
  brand: string | null;
  model: string | null;
  draw_weight: string | null;
  draw_length: string | null;
  handedness: string | null;
  shipping_available: boolean;
};

function PhotoPlaceholder() {
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 px-5 text-center">
      <div className="absolute left-5 top-5 h-16 w-16 rounded-full border border-emerald-300/20" />
      <div className="absolute bottom-5 right-5 h-20 w-20 rounded-full border border-white/10" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />

      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/40 bg-white/10 text-2xl">
          🎯
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
          No Photo Yet
        </p>
      </div>
    </div>
  );
}

function HeroPhotoPlaceholder() {
  return (
    <div className="mb-5 flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-700 to-emerald-950 px-5 text-center">
      <div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-white/10 text-3xl">
          🎯
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
          Featured Gear
        </p>
      </div>
    </div>
  );
}

function getBrandModelText(item: Listing) {
  const brand = item.brand?.trim();
  const model = item.model?.trim();

  if (brand && model) {
    return `${brand} ${model}`;
  }

  if (brand) {
    return brand;
  }

  if (model) {
    return model;
  }

  return null;
}

function getCompactSpecs(item: Listing) {
  const specs = [];

  if (item.draw_weight?.trim()) {
    specs.push(`${item.draw_weight.trim()} draw`);
  }

  if (item.draw_length?.trim()) {
    specs.push(`${item.draw_length.trim()} length`);
  }

  if (item.handedness?.trim()) {
    specs.push(item.handedness.trim());
  }

  return specs;
}

function getListingPhotoUrl(item: Listing) {
  if (item.image_urls && item.image_urls.length > 0 && item.image_urls[0]) {
    return item.image_urls[0];
  }

  return item.image_url;
}

export default async function Home() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);

  const featuredListings = (data || []) as Listing[];
  const heroListing = featuredListings[0] || null;
  const heroPhotoUrl = heroListing ? getListingPhotoUrl(heroListing) : null;

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header activePage="home" />

      <section className="bg-stone-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Rugged marketplace for archers
            </p>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Buy and sell archery gear with confidence.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Archery Swap is a rugged but clean marketplace for bows,
              crossbows, arrows, sights, releases, cases, targets, and
              accessories.
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-400">
              New listings are reviewed before they appear publicly so the site
              stays cleaner and easier to shop.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/browse"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-center font-black text-white hover:bg-emerald-500"
              >
                Browse Gear
              </Link>

              <Link
                href="/sell"
                className="rounded-xl border border-stone-600 px-6 py-3 text-center font-black text-white hover:bg-stone-900"
              >
                Sell Your Gear
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-700 bg-stone-900 p-6 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                Featured Listing
              </p>

              <Link
                href="/browse"
                className="text-sm font-black text-stone-300 hover:text-white"
              >
                View All
              </Link>
            </div>

            {heroListing ? (
              <div className="rounded-2xl bg-stone-800 p-6">
                {heroPhotoUrl ? (
                  <div className="mb-5 flex h-56 items-center justify-center rounded-2xl bg-stone-200 p-3">
                    <img
                      src={heroPhotoUrl}
                      alt={heroListing.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <HeroPhotoPlaceholder />
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    {heroListing.category}
                  </p>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-stone-200">
                    {heroListing.condition}
                  </span>
                </div>

                <h3 className="mt-3 text-2xl font-black">
                  {heroListing.title}
                </h3>

                <p className="mt-2 text-stone-300">
                  {heroListing.location || "Location not listed"}
                </p>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="text-3xl font-black">
                    ${Number(heroListing.price).toLocaleString()}
                  </p>
                  <Link
                    href={`/listing/${heroListing.id}`}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-black text-stone-950 hover:bg-stone-200"
                  >
                    View Listing
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-stone-800 p-6">
                <HeroPhotoPlaceholder />

                <h3 className="text-2xl font-black">No featured listing yet</h3>

                <p className="mt-2 text-stone-300">
                  Approved listings will appear here once gear is active on the
                  marketplace.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/browse"
                    className="rounded-xl bg-white px-4 py-2 text-center text-sm font-black text-stone-950 hover:bg-stone-200"
                  >
                    Browse Gear
                  </Link>

                  <Link
                    href="/sell"
                    className="rounded-xl border border-stone-600 px-4 py-2 text-center text-sm font-black text-white hover:bg-stone-900"
                  >
                    List Gear
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="browse" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
              Shop by category
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Find the gear you need.
            </h2>
          </div>

          <Link
            href="/browse"
            className="rounded-xl border border-stone-400 px-5 py-3 text-center text-sm font-black text-stone-950 hover:bg-white"
          >
            Browse All Gear
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/browse?category=${encodeURIComponent(category)}`}
              className="group rounded-2xl border border-stone-300 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black">{category}</h3>

                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-800">
                  Browse
                </span>
              </div>

              <p className="mt-2 text-stone-600">
                Browse new and used {category.toLowerCase()} from other
                archers.
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
                Featured listings
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Fresh gear on the market.
              </h2>
            </div>

            <Link
              href="/browse"
              className="rounded-xl border border-stone-400 px-5 py-3 text-center text-sm font-black text-stone-950 hover:bg-stone-100"
            >
              See More Listings
            </Link>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm font-bold text-red-800">
              Could not load featured listings: {error.message}
            </div>
          ) : null}

          {!error && featuredListings.length === 0 ? (
            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-8 text-center shadow-sm">
              <h3 className="text-2xl font-black">No active listings yet</h3>
              <p className="mt-2 text-stone-600">
                Once listings are approved, featured gear will appear here.
              </p>

              <Link
                href="/sell"
                className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-500"
              >
                List Your Gear
              </Link>
            </div>
          ) : null}

          {!error && featuredListings.length > 0 ? (
            <div className="grid items-stretch gap-5 md:grid-cols-3">
              {featuredListings.map((item) => {
                const brandModelText = getBrandModelText(item);
                const compactSpecs = getCompactSpecs(item);
                const photoUrl = getListingPhotoUrl(item);

                return (
                  <article
                    key={item.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-300 bg-stone-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {photoUrl ? (
                      <div className="flex h-44 items-center justify-center bg-stone-200 p-3">
                        <img
                          src={photoUrl}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain transition group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : (
                      <PhotoPlaceholder />
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                          {item.category}
                        </p>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-stone-700">
                          {item.condition}
                        </span>
                      </div>

                      <h3 className="mt-3 line-clamp-2 text-xl font-black">
                        {item.title}
                      </h3>

                      {brandModelText ? (
                        <p className="mt-1 line-clamp-1 text-sm font-black text-stone-700">
                          {brandModelText}
                        </p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {compactSpecs.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-bold text-stone-700"
                          >
                            {spec}
                          </span>
                        ))}

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            item.shipping_available
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : "border-stone-300 bg-white text-stone-700"
                          }`}
                        >
                          {item.shipping_available
                            ? "Shipping Available"
                            : "Local Only"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-bold text-stone-500">
                        {item.location || "Location not listed"}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                        <p className="text-2xl font-black">
                          ${Number(item.price).toLocaleString()}
                        </p>
                        <Link
                          href={`/listing/${item.id}`}
                          className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
                        >
                          View Listing
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-stone-950 p-8 text-white md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            How it works
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Buy and sell archery gear in a few clear steps.
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Step 1
              </p>
              <h3 className="mt-3 text-xl font-black">List your gear</h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Add photos, price, condition, category, specs, and description.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Step 2
              </p>
              <h3 className="mt-3 text-xl font-black">Wait for review</h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Listings are reviewed before they show publicly on Browse Gear.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Step 3
              </p>
              <h3 className="mt-3 text-xl font-black">Connect with buyers</h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Buyers can message sellers or make offers on eligible active
                listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="sell" className="bg-emerald-950 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="max-w-3xl text-3xl font-black sm:text-4xl">
              Ready to turn unused gear into cash?
            </h2>

            <p className="mt-4 max-w-2xl text-emerald-50">
              List bows, crossbows, sights, releases, arrows, cases, targets,
              and accessories on Archery Swap.
            </p>
          </div>

          <Link
            href="/sell"
            className="rounded-xl bg-white px-6 py-3 text-center font-black text-emerald-950 hover:bg-emerald-50"
          >
            List Your Gear
          </Link>
        </div>
      </section>
    </main>
  );
}