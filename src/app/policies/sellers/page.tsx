import Header from "@/components/Header";
import Link from "next/link";

export default function SellerPolicyPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Seller Policy
          </p>

          <h2 className="mt-4 text-5xl font-black tracking-tight">
            Seller responsibilities for listings, shipping, and payout.
          </h2>

          <p className="mt-5 text-lg leading-8 text-stone-300">
            This starter seller policy explains the basic rules for selling gear
            on Archery Outlet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div>
            <h3 className="text-2xl font-black">Accurate listings</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Sellers must describe gear honestly, include clear photos, list
              the correct condition, and disclose important details that buyers
              should know before purchasing.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Listing review</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Listings are reviewed before they appear publicly. Listings may be
              denied or removed if they are unclear, incomplete, inaccurate, or
              not appropriate for the marketplace.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Seller payout</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Seller payout is not released automatically at checkout. Payout may
              be held while the seller ships the item and shipment details are
              reviewed.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Shipping responsibility</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Sellers are responsible for shipping sold items, adding valid
              carrier and tracking information, and packaging items safely.
            </p>
          </div>

          <div className="rounded-2xl bg-stone-100 p-5 text-sm font-bold leading-6 text-stone-600">
            Starter policy only. This page should be reviewed and finalized
            before launch.
          </div>

          <Link
            href="/policies"
            className="inline-block rounded-xl border border-stone-400 px-5 py-3 text-sm font-black hover:bg-stone-100"
          >
            Back to Policies
          </Link>
        </div>
      </section>
    </main>
  );
}
