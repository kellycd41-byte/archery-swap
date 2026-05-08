import Link from "next/link";

const activeListings = [
  {
    title: "Mathews V3X Compound Bow",
    price: "$875",
    status: "Active",
  },
  {
    title: "Spot Hogg Fast Eddie Sight",
    price: "$265",
    status: "Active",
  },
];

const savedItems = [
  {
    title: "Ravin Crossbow Package",
    price: "$1,050",
  },
  {
    title: "Easton Axis Arrows - Dozen",
    price: "$115",
  },
];

export default function AccountPage() {
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
            <Link href="/account" className="text-emerald-300">
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
            Account
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            Manage your Archery Swap profile.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            This page will eventually connect to real user login, seller
            profiles, listings, favorites, messages, and purchase history.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-950 text-3xl font-black text-white">
            BH
          </div>

          <h3 className="mt-5 text-2xl font-black">BowHunter41</h3>

          <p className="mt-1 text-stone-600">Pennsylvania</p>

          <div className="mt-5 rounded-2xl bg-stone-100 p-4">
            <p className="font-black">Seller rating</p>
            <p className="mt-1 text-3xl font-black">4.9</p>
            <p className="text-sm text-stone-600">18 completed sales</p>
          </div>

          <div className="mt-5 space-y-2">
            <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-500">
              Edit Profile
            </button>

            <button className="w-full rounded-xl border border-stone-400 px-4 py-3 font-black text-stone-950 hover:bg-stone-100">
              Account Settings
            </button>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-2xl font-black">My active listings</h3>
                <p className="text-stone-600">
                  Items currently listed for sale.
                </p>
              </div>

              <Link
                href="/sell"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
              >
                List New Item
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {activeListings.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-stone-300 bg-stone-50 p-5"
                >
                  <div className="mb-4 h-36 rounded-2xl bg-gradient-to-br from-stone-300 to-emerald-900" />

                  <h4 className="text-xl font-black">{item.title}</h4>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-black">{item.price}</p>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
                      {item.status}
                    </span>
                  </div>

                  <Link
                    href="/listing/1"
                    className="mt-4 inline-block rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
                  >
                    View Listing
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black">Saved items</h3>
            <p className="mt-1 text-stone-600">
              Gear you saved while browsing.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {savedItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-stone-300 bg-stone-50 p-5"
                >
                  <div className="mb-4 h-32 rounded-2xl bg-gradient-to-br from-stone-300 to-emerald-900" />

                  <h4 className="text-xl font-black">{item.title}</h4>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-black">{item.price}</p>
                    <Link
                      href="/listing/1"
                      className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-black">Account tools</h3>
            <p className="mt-1 text-stone-600">
              These buttons are placeholders for features we will connect later.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link
                href="/messages"
                className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
              >
                Messages
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
          </section>
        </div>
      </section>
    </main>
  );
}