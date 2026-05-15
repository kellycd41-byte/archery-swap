import Header from "@/components/Header";
import Link from "next/link";

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Shipping Policy
          </p>

          <h2 className="mt-4 text-5xl font-black tracking-tight">
            Seller shipping expectations and tracking rules.
          </h2>

          <p className="mt-5 text-lg leading-8 text-stone-300">
            This starter shipping policy explains the basic shipping flow for
            Archery Outlet orders.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div>
            <h3 className="text-2xl font-black">Shipping is required</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Archery Outlet orders are handled as shipped orders. Sellers should
              include accurate shipping cost information when creating or
              editing listings.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Tracking information</h3>
            <p className="mt-3 leading-8 text-stone-600">
              After a sale, the seller must add the shipping carrier and
              tracking number. Tracking information may be reviewed before seller
              payout is released.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Ship promptly</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Sellers should ship sold items promptly and package gear safely so
              it arrives in the condition shown in the listing.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Shipment review</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Archery Outlet may review shipment details before releasing seller
              payout. This helps reduce problems with invalid tracking or
              unshipped orders.
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
