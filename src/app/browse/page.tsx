import Link from "next/link";

const listings = [
  {
    title: "Mathews V3X Compound Bow",
    price: "$875",
    condition: "Excellent",
    category: "Bows",
    location: "Pennsylvania",
    href: "/listing/1",
  },
  {
    title: "Ravin Crossbow Package",
    price: "$1,050",
    condition: "Very Good",
    category: "Crossbows",
    location: "Ohio",
    href: "/listing/1",
  },
  {
    title: "Spot Hogg Fast Eddie Sight",
    price: "$265",
    condition: "Good",
    category: "Sights",
    location: "Michigan",
    href: "/listing/1",
  },
  {
    title: "Stan Thumb Release",
    price: "$210",
    condition: "Very Good",
    category: "Releases",
    location: "Georgia",
    href: "/listing/1",
  },
  {
    title: "Easton Axis Arrows - Dozen",
    price: "$115",
    condition: "New",
    category: "Arrows",
    location: "New York",
    href: "/listing/1",
  },
  {
    title: "Plano Bow Case",
    price: "$85",
    condition: "Good",
    category: "Cases",
    location: "West Virginia",
    href: "/listing/1",
  },
];

const categories = [
  "All",
  "Bows",
  "Crossbows",
  "Sights",
  "Releases",
  "Arrows",
  "Cases",
];

export default function BrowsePage() {
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
            This is the first version of the marketplace browse page. Later,
            we’ll connect it to a real database, real photos, search, filters,
            user accounts, and payments.
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
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-700"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-stone-700">Category</p>

              <div className="mt-3 space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className="block w-full rounded-xl border border-stone-300 px-4 py-2 text-left text-sm font-bold hover:border-emerald-700 hover:bg-emerald-50"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-black text-stone-700">Condition</p>

              <div className="mt-3 space-y-2 text-sm font-bold">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  New
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Excellent
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Very Good
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Good
                </label>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-2xl font-black">Available Gear</h3>
                <p className="text-stone-600">
                  Showing sample listings for the first prototype.
                </p>
              </div>

              <select className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold">
                <option>Sort: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm"
                >
                  <div className="h-48 bg-gradient-to-br from-stone-300 to-emerald-900" />

                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                      {item.category}
                    </p>

                    <h4 className="mt-2 text-xl font-black">{item.title}</h4>

                    <p className="mt-2 text-sm font-bold text-stone-500">
                      {item.condition} • {item.location}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-2xl font-black">{item.price}</p>

                      <Link
                        href={item.href}
                        className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}