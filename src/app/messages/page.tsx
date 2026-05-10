import Link from "next/link";

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <header className="border-b border-stone-300 bg-stone-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
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
            <Link href="/messages" className="text-emerald-300">
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
            <summary className="cursor-pointer list-none rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500">
              Menu
            </summary>

            <div className="absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-stone-700 bg-stone-950 p-3 shadow-xl">
              <Link
                href="/"
                className="block rounded-xl px-4 py-3 text-sm font-bold text-white hover:bg-stone-800 hover:text-emerald-300"
              >
                Home
              </Link>
              <Link
                href="/browse"
                className="block rounded-xl px-4 py-3 text-sm font-bold text-white hover:bg-stone-800 hover:text-emerald-300"
              >
                Browse Gear
              </Link>
              <Link
                href="/sell"
                className="block rounded-xl px-4 py-3 text-sm font-bold text-white hover:bg-stone-800 hover:text-emerald-300"
              >
                Sell Gear
              </Link>
              <Link
                href="/messages"
                className="block rounded-xl bg-stone-800 px-4 py-3 text-sm font-bold text-emerald-300"
              >
                Messages
              </Link>
              <Link
                href="/account"
                className="block rounded-xl px-4 py-3 text-sm font-bold text-white hover:bg-stone-800 hover:text-emerald-300"
              >
                Account
              </Link>
            </div>
          </details>
        </div>
      </header>

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Messages
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Direct buyer and seller messaging is coming soon.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            We are preparing a safer messaging system for Archery Swap. Once it
            is ready, buyers and sellers will be able to contact each other
            directly from listings.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div className="rounded-3xl border border-dashed border-emerald-700 bg-emerald-50 p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
              Coming Soon
            </p>

            <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950">
              Messaging is not active yet.
            </h3>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
              This page is ready for the future messaging feature, but real
              conversations are not connected yet. We removed the fake inbox so
              the site feels cleaner and more honest while we finish the
              marketplace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                href="/browse"
                className="rounded-2xl bg-stone-950 px-5 py-4 text-center text-sm font-black text-white hover:bg-stone-800"
              >
                Browse Gear
              </Link>

              <Link
                href="/sell"
                className="rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500"
              >
                List Your Gear
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Buyer questions</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Buyers will be able to ask about condition, included gear, and
                shipping before making a deal.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Seller replies</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Sellers will be able to respond from one inbox instead of
                managing messages across different places.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Safer deals</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Messaging will be built with account support so conversations
                can be tied to real listings and users.
              </p>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black">What to do for now</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Looking to buy?</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Browse available listings and review the item details,
                description, photos, and seller information shown on the
                listing page.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Looking to sell?</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Create a detailed listing with clear photos, specs, condition,
                location, and shipping information so buyers know what you are
                offering.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950 p-5 text-white">
              <p className="font-black text-emerald-300">Next major step</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Real messaging will work best after account sign-in is added, so
                messages can be connected to the correct buyer, seller, and
                listing.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}