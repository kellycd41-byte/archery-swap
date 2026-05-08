import Link from "next/link";

const categories = [
  "Bows",
  "Crossbows",
  "Sights",
  "Releases",
  "Arrows",
  "Cases",
  "Targets",
  "Accessories",
];

const conditions = ["New", "Excellent", "Very Good", "Good", "Fair"];

export default function SellPage() {
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
            <Link href="/sell" className="text-emerald-300">
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
            href="/browse"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
          >
            Browse Gear
          </Link>
        </div>
      </header>

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Sell Gear
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            List your archery gear for sale.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            This is the first version of the listing form. Later, we’ll connect
            it to user accounts, photo uploads, Supabase, payments, and shipping.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <h3 className="text-3xl font-black">Create a listing</h3>
            <p className="mt-2 text-stone-600">
              Add the basic details a buyer needs to understand what you are
              selling.
            </p>
          </div>

          <form className="space-y-7">
            <div>
              <label className="text-sm font-black text-stone-700">
                Item title
              </label>
              <input
                type="text"
                placeholder="Example: Mathews V3X 33 Compound Bow"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-black text-stone-700">
                  Category
                </label>
                <select className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700">
                  <option>Select a category</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-black text-stone-700">
                  Condition
                </label>
                <select className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700">
                  <option>Select condition</option>
                  {conditions.map((condition) => (
                    <option key={condition}>{condition}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-black text-stone-700">
                  Price
                </label>
                <input
                  type="text"
                  placeholder="$875"
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="text-sm font-black text-stone-700">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Pennsylvania"
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-black text-stone-700">
                Description
              </label>
              <textarea
                placeholder="Describe the item, condition, included accessories, draw weight, draw length, age, and anything buyers should know."
                rows={6}
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="text-sm font-black text-stone-700">
                Photos
              </label>

              <div className="mt-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-8 text-center">
                <p className="font-black">Upload photos</p>
                <p className="mt-2 text-sm text-stone-600">
                  Photo upload will be connected later. For now this is a
                  placeholder.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <h4 className="font-black">Listing safety checklist</h4>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li>• Use clear photos from multiple angles.</li>
                <li>• Be honest about wear, damage, or missing parts.</li>
                <li>• Include important bow specs when possible.</li>
                <li>• Do not share payment info outside the platform.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500"
              >
                Preview Listing
              </button>

              <button
                type="button"
                className="rounded-xl border border-stone-400 px-6 py-3 font-black text-stone-950 hover:bg-stone-100"
              >
                Save Draft
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}