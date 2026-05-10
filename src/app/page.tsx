import Link from "next/link";

const categories = [
  "Compound Bows",
  "Crossbows",
  "Traditional Bows",
  "Sights",
  "Releases",
  "Arrows",
  "Cases",
];

const steps = [
  {
    title: "List your gear",
    text: "Add the details buyers care about, including brand, model, condition, draw weight, draw length, handedness, photos, and price.",
  },
  {
    title: "Admin review",
    text: "New listings are reviewed before they appear publicly so the marketplace stays cleaner and more trustworthy.",
  },
  {
    title: "Connect with buyers",
    text: "Buyers can browse approved listings, view the full gear details, and reach out when they are interested.",
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
            <Link href="/admin" className="hover:text-emerald-300">
              Admin
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
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Account
              </Link>
              <Link
                href="/admin"
                className="block px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Admin
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
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
              Built for archery gear
            </p>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Buy and sell archery gear without the clutter.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Archery Swap is a clean, rugged marketplace for bows, crossbows,
              sights, releases, arrows, cases, and accessories. Browse approved
              listings or submit your own gear for review.
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

            <p className="mt-5 max-w-xl text-sm leading-6 text-stone-400">
              New listings are submitted as pending and reviewed before they go
              public.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-700 bg-stone-900 p-6 shadow-2xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              What you can list
            </p>

            <div className="grid gap-3">
              {categories.map((category) => (
                <Link
                  key={category}
                  href="/browse"
                  className="rounded-2xl border border-stone-700 bg-stone-800 p-4 hover:border-emerald-500"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-black">{category}</p>
                    <span className="text-sm font-black text-emerald-300">
                      Browse
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
            Marketplace basics
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Simple, focused, and built around archery.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-xl font-black text-white">
                {index + 1}
              </div>

              <h3 className="text-xl font-black">{step.title}</h3>

              <p className="mt-3 leading-7 text-stone-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl bg-stone-950 p-8 text-white md:p-12">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              Ready to get started?
            </p>

            <div className="mt-4 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h2 className="max-w-3xl text-3xl font-black sm:text-4xl">
                  Find your next setup or turn unused gear into cash.
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-stone-300">
                  Browse approved gear now, or submit a listing with photos and
                  detailed specs for review.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                <Link
                  href="/browse"
                  className="rounded-xl bg-white px-6 py-3 text-center font-black text-stone-950"
                >
                  Browse Gear
                </Link>

                <Link
                  href="/sell"
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-center font-black text-white hover:bg-emerald-500"
                >
                  List Your Gear
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
