import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  {
    title: "Seller responsibility",
    body: [
      "Sellers are responsible for using Archery Outlet honestly and for providing accurate information about their listings, item condition, pricing, shipping costs, shipment details, and payout setup.",
      "Sellers should respond to buyer questions, order issues, and Archery Outlet support requests when needed.",
    ],
  },
  {
    title: "Accurate listings",
    body: [
      "Sellers must describe gear honestly and clearly. Listings should include clear photos, the correct item condition, accurate item details, accurate price, accurate shipping cost, and any important issues a buyer should know before purchasing.",
      "Sellers should disclose damage, heavy wear, missing parts, modifications, tuning issues, accessories included or not included, and anything else that could affect a buyer's decision.",
    ],
  },
  {
    title: "Listing review",
    body: [
      "Listings are reviewed before they appear publicly. Archery Outlet may approve, deny, edit, hide, remove, or request changes to a listing.",
      "Listings may be denied or removed if they are unclear, incomplete, inaccurate, suspicious, unsafe, prohibited, or not appropriate for the marketplace.",
    ],
  },
  {
    title: "Pricing and shipping cost",
    body: [
      "Sellers choose their item price and shipping cost. The shipping cost should be realistic for the item being sold.",
      "The buyer pays the item price plus the listed shipping cost at checkout. Seller payout may be reduced by marketplace fees, refunds, adjustments, or other order-related amounts when applicable.",
    ],
  },
  {
    title: "Offers",
    body: [
      "If offers are enabled on a listing, buyers may send offers to the seller. A seller may accept or decline an offer.",
      "An accepted offer does not complete the sale by itself. The buyer must still complete checkout before the listing is marked sold.",
    ],
  },
  {
    title: "Shipping sold items",
    body: [
      "After an item sells, the seller is responsible for shipping the item promptly and packaging it safely so it arrives in the condition shown and described in the listing.",
      "Sellers should keep proof of shipment, carrier receipts, package photos, or other shipment records in case an order issue is reported.",
    ],
  },
  {
    title: "Tracking information",
    body: [
      "Sellers must add accurate carrier and tracking information after shipping an order.",
      "Missing, incorrect, invalid, suspicious, or delayed tracking may delay seller payout release while Archery Outlet reviews the order.",
    ],
  },
  {
    title: "Seller payout setup",
    body: [
      "Sellers may need to complete Stripe seller payout setup before receiving seller payouts. Stripe may require identity, banking, tax, or other information to enable seller payouts.",
      "Archery Outlet cannot release seller payout to a seller account that is not ready to receive payouts.",
    ],
  },
  {
    title: "Seller payout hold",
    body: [
      "Seller payout is not released automatically at checkout. Seller payout may be held while the order is prepared, shipped, tracking is submitted, and shipment information is reviewed.",
      "Archery Outlet may release seller payout after the shipment has been reviewed. Bank timing and Stripe payout timing may vary after payout release.",
    ],
  },
  {
    title: "Fees",
    body: [
      "Archery Outlet may collect a marketplace fee from the seller payout. The fee may be based on the item price and may be subject to minimums or other marketplace rules.",
      "Fee details may be shown in the marketplace or order records and may be updated over time.",
    ],
  },
  {
    title: "Reviews",
    body: [
      "Buyers may be able to leave a seller review after a completed order. Seller reviews help future buyers understand prior transaction experiences.",
      "Sellers may not create fake reviews, pressure buyers to leave dishonest reviews, or attempt to manipulate seller ratings.",
    ],
  },
  {
    title: "Disputes and order problems",
    body: [
      "If an order problem is reported, Archery Outlet may review listing details, photos, messages, order records, tracking information, payout status, and buyer and seller communication.",
      "Seller payout may be delayed, cancelled, adjusted, or affected by refunds, disputes, fraud concerns, invalid tracking, failure to ship, inaccurate listings, or other order problems.",
    ],
  },
  {
    title: "Prohibited seller activity",
    body: [
      "Sellers may not create false listings, sell items they do not have, avoid marketplace checkout, avoid marketplace fees, provide fake tracking, manipulate reviews, harass buyers, or use Archery Outlet for fraud or unsafe activity.",
      "Archery Outlet may limit, suspend, or remove seller access if seller activity creates risk for buyers, sellers, or the marketplace.",
    ],
  },
  {
    title: "Seller support",
    body: [
      "Seller questions can be sent to support@archeryoutlet.net.",
      "When contacting support about an order, include the listing title, order details, tracking number if available, and a clear explanation of the issue.",
    ],
  },
];

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
            This policy explains seller responsibilities for listings, offers,
            shipping, tracking, payout setup, payout release, reviews, and order
            problems.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-7 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5 text-sm font-bold leading-6 text-stone-700">
            This Seller Policy explains seller responsibilities for listings,
            shipping, tracking, payouts, reviews, and order issues.
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-2xl font-black">{section.title}</h3>

              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-8 text-stone-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-stone-100 p-5 text-sm font-bold leading-6 text-stone-600">
            Seller questions can be sent to support@archeryoutlet.net.
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
