import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Terms of Service
          </p>

          <h2 className="mt-4 text-5xl font-black tracking-tight">
            Marketplace rules for using Archery Outlet.
          </h2>

          <p className="mt-5 text-lg leading-8 text-stone-300">
            These starter terms explain the basic rules for buyers and sellers.
            They should be reviewed before Archery Outlet opens to real users.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div>
            <h3 className="text-2xl font-black">Using the marketplace</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Archery Outlet is a marketplace for buying and selling archery
              gear. Users are responsible for providing accurate account,
              listing, payment, and shipping information.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Listings</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Listings must describe the item honestly, include clear photos,
              and follow marketplace rules. Listings are reviewed before they
              are posted publicly.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Orders and payment</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Buyers pay through checkout. Seller payout may be held while the
              order is prepared, shipped, and reviewed. Seller payout is not
              released automatically at checkout.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Shipping</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Sellers are responsible for shipping sold items and adding valid
              carrier and tracking information. Orders may be reviewed before
              payout is released.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Account responsibility</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Users are responsible for activity on their accounts and should
              keep login information secure.
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
      <Footer />
    </main>
  );
}
