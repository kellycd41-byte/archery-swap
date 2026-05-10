import Link from "next/link";

const categories = [
  "Bows",
  "Crossbows",
  "Sights",
  "Releases",
  "Arrows",
  "Cases",
];

const listings = [
  {
    title: "Mathews V3X Compound Bow",
    price: "$875",
    condition: "Excellent",
    location: "Pennsylvania",
  },
  {
    title: "Ravin Crossbow Package",
    price: "$1,050",
    condition: "Very Good",
    location: "Ohio",
  },
  {
    title: "Spot Hogg Fast Eddie Sight",
    price: "$265",
    condition: "Good",
    location: "Michigan",
  },
];

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
            <a href="#how" className="hover:text-emerald-300">
              How It Works
            </a>
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

function PhotoPlaceholder() {
  return (
    <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-stone-300 to-emerald-900">
      <div className="absolute left-5 top-5 h-16 w-16 rounded-full border border-white/20" />
      <div className="absolute bottom-5 right-5 h-20 w-20 rounded-full border border-emerald-200/20" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-white/20" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

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
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              Featured Listing
            </p>

            <div className="rounded-2xl bg-stone-800 p-6">
              <div className="mb-5 h-56 rounded-2xl bg-gradient-to-br from-stone-700 to-emerald-950" />

              <h3 className="text-2xl font-black">
                Mathews V3X Compound Bow
              </h3>

              <p className="mt-2 text-stone-300">
                Excellent condition • Pennsylvania
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-3xl font-black">$875</p>
                <Link
                  href="/browse"
                  className="rounded-xl bg-white px-4 py-2 text-sm font-black text-stone-950"
                >
                  Browse Gear
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="browse" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
            Shop by category
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Find the gear you need.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category}
              href="/browse"
              className="rounded-2xl border border-stone-300 bg-white p-6 shadow-sm hover:border-emerald-700"
            >
              <h3 className="text-xl font-black">{category}</h3>
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
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
              Featured listings
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Fresh gear on the market.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {listings.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-300 bg-stone-50 p-5 shadow-sm"
              >
                <PhotoPlaceholder />

                <h3 className="mt-5 text-xl font-black">{item.title}</h3>

                <p className="mt-2 text-sm font-bold text-stone-500">
                  {item.condition} • {item.location}
                </p>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <p className="text-2xl font-black">{item.price}</p>
                  <Link
                    href="/browse"
                    className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white"
                  >
                    Browse
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm font-bold text-stone-500">
            Featured examples are for layout only. Real approved listings are on
            the Browse Gear page.
          </p>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-stone-950 p-8 text-white md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            How it works
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Simple enough for day one.
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-black">1. List your gear</h3>
              <p className="mt-2 text-stone-300">
                Add photos, price, condition, category, specs, and description.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-black">2. Wait for review</h3>
              <p className="mt-2 text-stone-300">
                Listings are reviewed before they show publicly on Browse Gear.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-black">3. Connect with buyers</h3>
              <p className="mt-2 text-stone-300">
                Buyers can view approved listings and reach out when interested.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="sell" className="bg-emerald-950 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-3xl text-3xl font-black sm:text-4xl">
            Ready to turn unused gear into cash?
          </h2>

          <p className="mt-4 max-w-2xl text-emerald-50">
            List bows, crossbows, sights, releases, arrows, cases, targets, and
            accessories on Archery Swap.
          </p>

          <Link
            href="/sell"
            className="mt-7 inline-block rounded-xl bg-white px-6 py-3 font-black text-emerald-950"
          >
            List Your Gear
          </Link>
        </div>
      </section>
    </main>
  );
}
