import Header from "@/components/Header";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Refund Policy
          </p>

          <h2 className="mt-4 text-5xl font-black tracking-tight">
            How order issues and refund requests may be reviewed.
          </h2>

          <p className="mt-5 text-lg leading-8 text-stone-300">
            This starter refund policy explains the basic review process when an
            order has a problem.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div>
            <h3 className="text-2xl font-black">Refund review</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Refund requests may be reviewed when an item is not shipped, the
              tracking information is invalid, the item is materially different
              from the listing, or another serious order issue is reported.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Seller payout hold</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Seller payout may be held while shipment details are reviewed.
              This helps protect buyers and gives Archery Outlet time to review
              order issues before payout release.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Buyer responsibility</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Buyers should review listing photos, item details, condition, and
              shipping information before purchasing.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Seller responsibility</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Sellers should describe items honestly, ship promptly, package
              items safely, and provide valid tracking information.
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
