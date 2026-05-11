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
            <Link href="/messages" className="hover:text-emerald-300">
              Messages
            </Link>
            <Link href="/account" className="text-emerald-300">
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
                className="block bg-stone-800 px-4 py-3 text-sm font-bold text-emerald-300"
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

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Account
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Account tools are coming soon.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            We are preparing real sign-in for Archery Swap. Once it is ready,
            buyers and sellers will be able to manage profiles, listings,
            messages, saved gear, and account settings.
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
              Sign-in is not active yet.
            </h3>

            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
              This page is ready for future account features, but user login is
              not connected yet. We removed fake profile information, fake
              listings, and fake saved items so the site stays honest while the
              marketplace is being finished.
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
              <p className="text-lg font-black">Seller profiles</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Sellers will be able to manage their profile, location, contact
                preferences, and gear listings.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Saved gear</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Buyers will be able to save listings and return to gear they are
                interested in later.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Listing control</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Users will eventually be able to view, update, pause, and manage
                their own active listings.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-stone-100 p-5">
            <h3 className="text-xl font-black">Current status</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
              <li>• Browsing approved listings works now.</li>
              <li>• Submitting listings for review works now.</li>
              <li>• Admin approval tools work now.</li>
              <li>• Real account sign-in will be added later.</li>
            </ul>
          </div>
        </div>

        <aside className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-2xl font-black">What accounts will unlock</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Real messaging</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Account sign-in will let messages connect to the correct buyer,
                seller, and listing.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Safer marketplace tools</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                User accounts will help support safer deals, listing ownership,
                seller history, and future trust features.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Saved listings</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Buyers will be able to save gear and return to listings they are
                considering.
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
              href="/messages"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              View Messages Page
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