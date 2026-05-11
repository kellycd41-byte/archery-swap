import Link from "next/link";

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
                className="block border-b border-stone-800 bg-stone-800 px-4 py-3 text-sm font-bold text-emerald-300"
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

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Messages
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Buyer and seller messaging is coming soon.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            We are preparing a safer messaging system for Archery Swap. Once
            account sign-in is ready, buyers and sellers will be able to contact
            each other directly from listings.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="rounded-3xl border border-dashed border-emerald-700 bg-emerald-50 p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
              Coming Soon
            </p>

            <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950">
              Messaging is not active yet.
            </h3>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
              This page is ready for the future messaging feature, but real
              conversations are not connected yet. We removed the fake inbox so
              the site stays cleaner and more honest while the marketplace is
              being finished.
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
                Buyers will be able to ask about condition, included gear,
                specs, pickup, and shipping before making a deal.
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
              <p className="text-lg font-black">Listing context</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Conversations will be connected to the correct listing so buyers
                and sellers know exactly which item they are discussing.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-stone-100 p-5">
            <h3 className="text-xl font-black">Current status</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
              <li>• Approved listings can be browsed now.</li>
              <li>• Listing detail pages show photos, specs, and descriptions now.</li>
              <li>• New listings can be submitted for admin review now.</li>
              <li>• Real messaging will be added later with account sign-in.</li>
            </ul>
          </div>
        </div>

        <aside className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-2xl font-black">What to do for now</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Looking to buy?</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Browse available listings and review item details, photos,
                description, seller information, location, and shipping status.
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

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Building toward launch</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Messaging will work best after account sign-in is added, so
                messages can be connected to the correct buyer, seller, and
                listing.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950 p-5 text-white">
              <p className="font-black text-emerald-300">For now</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                You can still browse approved listings and submit new gear for
                admin review using the current Sell page.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/account"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              View Account Page
            </Link>

            <Link
              href="/browse"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              Browse Gear
            </Link>

            <Link
              href="/sell"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              Sell Gear
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}