import Link from "next/link";

const stats = [
  {
    label: "Active listings",
    value: "124",
  },
  {
    label: "Pending reviews",
    value: "8",
  },
  {
    label: "Reported listings",
    value: "3",
  },
  {
    label: "Users",
    value: "462",
  },
];

const pendingListings = [
  {
    title: "Mathews V3X Compound Bow",
    seller: "BowHunter41",
    price: "$875",
    status: "Pending Review",
  },
  {
    title: "Ravin Crossbow Package",
    seller: "CrossbowCrew",
    price: "$1,050",
    status: "Pending Review",
  },
  {
    title: "Spot Hogg Fast Eddie Sight",
    seller: "FullDrawGear",
    price: "$265",
    status: "Needs Photos",
  },
];

const reports = [
  {
    item: "Used Bow Case",
    reason: "Possible duplicate listing",
    reportedBy: "TargetTime",
  },
  {
    item: "Unknown Crossbow Listing",
    reason: "Missing item details",
    reportedBy: "BowBuyer22",
  },
];

export default function AdminPage() {
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
            <Link href="/account" className="hover:text-emerald-300">
              Account
            </Link>
            <Link href="/admin" className="text-emerald-300">
              Admin
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
            Admin Dashboard
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            Manage listings, users, reports, and marketplace activity.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            This is the first visual version of the admin area. Later, we’ll
            protect this page so only approved admins can access it.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-800">
                {stat.label}
              </p>
              <p className="mt-3 text-4xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-2xl font-black">Listings to review</h3>
                <p className="text-stone-600">
                  Review new or flagged listings before they go live.
                </p>
              </div>

              <Link
                href="/browse"
                className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
              >
                View Marketplace
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {pendingListings.map((listing) => (
                <div
                  key={listing.title}
                  className="rounded-2xl border border-stone-300 bg-stone-50 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                        {listing.status}
                      </p>

                      <h4 className="mt-2 text-xl font-black">
                        {listing.title}
                      </h4>

                      <p className="mt-1 text-sm font-bold text-stone-500">
                        Seller: {listing.seller} • Price: {listing.price}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href="/listing/1"
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-black text-white hover:bg-emerald-500"
                      >
                        Review
                      </Link>

                      <button className="rounded-xl border border-stone-400 px-4 py-2 text-sm font-black hover:bg-stone-100">
                        Approve
                      </button>

                      <button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-black">Reported listings</h3>
              <p className="mt-1 text-stone-600">
                User-submitted reports that need admin review.
              </p>

              <div className="mt-5 space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.item}
                    className="rounded-2xl border border-stone-300 bg-stone-50 p-4"
                  >
                    <h4 className="font-black">{report.item}</h4>
                    <p className="mt-2 text-sm text-stone-600">
                      Reason: {report.reason}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      Reported by: {report.reportedBy}
                    </p>

                    <button className="mt-3 rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800">
                      Review Report
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-black">Admin tools</h3>
              <p className="mt-1 text-stone-600">
                These are placeholders for future admin controls.
              </p>

              <div className="mt-5 grid gap-3">
                <button className="rounded-xl border border-stone-300 px-4 py-3 text-left font-black hover:bg-stone-100">
                  Manage users
                </button>

                <button className="rounded-xl border border-stone-300 px-4 py-3 text-left font-black hover:bg-stone-100">
                  Manage categories
                </button>

                <button className="rounded-xl border border-stone-300 px-4 py-3 text-left font-black hover:bg-stone-100">
                  View sales activity
                </button>

                <button className="rounded-xl border border-stone-300 px-4 py-3 text-left font-black hover:bg-stone-100">
                  Dispute center
                </button>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}