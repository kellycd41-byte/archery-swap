import Link from "next/link";

export default function ListingDetailPage() {
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
              <div className="h-[420px] rounded-2xl bg-gradient-to-br from-stone-300 to-emerald-900" />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="h-24 rounded-2xl bg-gradient-to-br from-stone-300 to-emerald-900" />
              <div className="h-24 rounded-2xl bg-stone-300" />
              <div className="h-24 rounded-2xl bg-stone-400" />
              <div className="h-24 rounded-2xl bg-stone-500" />
            </div>
          </div>

          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
              Bows
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Mathews V3X Compound Bow
            </h2>

            <p className="mt-3 text-stone-600">
              Excellent condition • Pennsylvania
            </p>

            <p className="mt-6 text-5xl font-black">$875</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500">
                Buy Now
              </button>

              <button className="rounded-xl border border-stone-400 px-6 py-3 font-black text-stone-950 hover:bg-stone-100">
                Message Seller
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-stone-100 p-5">
              <h3 className="font-black">Seller</h3>
              <p className="mt-2 font-bold">BowHunter41</p>
              <p className="text-sm text-stone-600">
                4.9 rating • 18 sales • Member since 2024
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-black">Item details</h3>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Condition</span>
                  <span className="font-black">Excellent</span>
                </div>

                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Category</span>
                  <span className="font-black">Bows</span>
                </div>

                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Location</span>
                  <span className="font-black">Pennsylvania</span>
                </div>

                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="font-bold text-stone-600">Shipping</span>
                  <span className="font-black">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black">Description</h3>

          <p className="mt-4 max-w-4xl leading-8 text-stone-700">
            Sample listing description. This area will show the seller’s full
            item details, included accessories, bow specs, draw weight, draw
            length, cosmetic wear, shipping notes, and anything else the buyer
            should know before purchasing.
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