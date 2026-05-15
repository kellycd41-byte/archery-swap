import Header from "@/components/Header";
import Link from "next/link";

const policies = [
  {
    title: "Terms of Service",
    href: "/policies/terms",
    description:
      "The basic rules for using Archery Outlet, creating listings, buying gear, and using the marketplace.",
  },
  {
    title: "Privacy Policy",
    href: "/policies/privacy",
    description:
      "How account, listing, order, and communication information may be used to operate the marketplace.",
  },
  {
    title: "Refund Policy",
    href: "/policies/refunds",
    description:
      "How refund requests may be handled when an order has an issue, is not shipped, or needs review.",
  },
  {
    title: "Shipping Policy",
    href: "/policies/shipping",
    description:
      "Seller shipping expectations, tracking requirements, and shipment review before payout release.",
  },
  {
    title: "Seller Policy",
    href: "/policies/sellers",
    description:
      "Seller responsibilities for accurate listings, approved items, shipping, and payout release.",
  },
];

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Policies
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            Clear rules for buyers, sellers, orders, and payouts.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            These pages explain the basic marketplace rules for Archery Outlet.
            They are starter policies and should be reviewed before opening the
            site to real users.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {policies.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-md"
            >
              <h3 className="text-2xl font-black">{policy.title}</h3>
              <p className="mt-3 leading-7 text-stone-600">
                {policy.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
