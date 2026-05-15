import Header from "@/components/Header";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Privacy Policy
          </p>

          <h2 className="mt-4 text-5xl font-black tracking-tight">
            How marketplace information may be used.
          </h2>

          <p className="mt-5 text-lg leading-8 text-stone-300">
            This starter privacy policy explains the basic information needed to
            operate Archery Outlet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-6 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div>
            <h3 className="text-2xl font-black">Information used</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Archery Outlet may use account information, listing details,
              messages, offers, order details, shipping information, and payment
              status information to operate the marketplace.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Payments</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Payments and seller payout setup are handled through Stripe.
              Archery Outlet should not store full card numbers.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Messages and orders</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Messages, offers, and order records may be used to support buyers
              and sellers, review disputes, and manage marketplace safety.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-black">Security</h3>
            <p className="mt-3 leading-8 text-stone-600">
              Users should protect their account access. Marketplace data should
              only be accessed when needed to operate, support, or protect the
              site.
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
