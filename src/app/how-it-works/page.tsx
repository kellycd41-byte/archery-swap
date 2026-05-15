import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const steps = [
  {
    title: "Create your account",
    description:
      "Sign up so you can list gear, message buyers or sellers, and track your orders in one place.",
  },
  {
    title: "List your archery gear",
    description:
      "Add photos, details, price, and shipping cost. Keep it simple and clear so buyers know exactly what you are selling.",
  },
  {
    title: "We review the listing",
    description:
      "Listings are reviewed before they are posted publicly. This helps keep the marketplace cleaner and safer for everyone.",
  },
  {
    title: "A buyer pays securely",
    description:
      "Buyers can purchase through checkout. Archery Outlet keeps the process organized from payment through shipment.",
  },
  {
    title: "Seller payout is held",
    description:
      "After checkout, the seller payout is held while the seller prepares and ships the item.",
  },
  {
    title: "Seller ships the order",
    description:
      "The seller adds the carrier and tracking number so the order can be reviewed and followed.",
  },
  {
    title: "Shipment is reviewed",
    description:
      "Shipment details are checked before the seller payout is released.",
  },
  {
    title: "Seller gets paid",
    description:
      "Once the shipment is reviewed, the seller payout is released.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header activePage="howItWorks" />

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            How It Works
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            A simple way to list, sell, and buy archery gear.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Archery Outlet keeps the process clear from account setup to seller
            payout, with listing review, secure checkout, shipment tracking, and
            payout release built into the flow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sell"
              className="rounded-xl bg-emerald-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-emerald-500"
            >
              List Your Gear
            </Link>

            <Link
              href="/browse"
              className="rounded-xl border border-stone-500 px-5 py-3 text-center text-sm font-black text-white hover:bg-stone-800"
            >
              Browse Gear
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-900">
                {index + 1}
              </div>

              <h3 className="mt-5 text-xl font-black">{step.title}</h3>

              <p className="mt-3 text-sm font-bold leading-6 text-stone-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="text-2xl font-black text-emerald-950">
            Built to feel simple, with protection behind the scenes.
          </h3>

          <p className="mt-3 max-w-4xl leading-8 text-emerald-900">
            Sellers can focus on listing good gear. Buyers can shop with a clear
            checkout and order flow. Archery Outlet reviews listings before they
            go live and holds seller payout until shipment details are reviewed.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
