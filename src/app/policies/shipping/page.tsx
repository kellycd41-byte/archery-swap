import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  {
    title: "Shipping is required",
    body: [
      "Archery Outlet orders are handled as shipped orders. Sellers should be prepared to ship sold items and provide carrier and tracking information.",
      "Local pickup is not currently part of the standard Archery Outlet checkout flow.",
    ],
  },
  {
    title: "Shipping cost",
    body: [
      "Sellers are responsible for entering an accurate shipping cost when creating or editing a listing.",
      "The buyer pays the item price plus the listed shipping cost at checkout. Sellers should make sure the shipping cost is realistic before a buyer purchases the item.",
    ],
  },
  {
    title: "Seller shipping responsibility",
    body: [
      "After an item sells, the seller is responsible for packaging the item safely, shipping it promptly, and adding accurate carrier and tracking information in the seller's account area.",
      "Sellers should package archery gear carefully so it is protected during shipment and arrives in the condition shown and described in the listing.",
    ],
  },
  {
    title: "Ship-by timing",
    body: [
      "Sellers should ship sold items promptly after payment is completed. Archery Outlet may show a ship-by date on the order to help sellers understand when shipment is expected.",
      "If a seller cannot ship on time, the seller should contact Archery Outlet support as soon as possible.",
    ],
  },
  {
    title: "Tracking information",
    body: [
      "After shipping, the seller must enter the shipping carrier and tracking number for the order.",
      "Buyers may receive an email update after tracking is submitted. Tracking helps the buyer follow the shipment and helps Archery Outlet review the order before seller payout is released.",
    ],
  },
  {
    title: "Shipment review before payout",
    body: [
      "Seller payout is not released automatically at checkout. Seller payout may be held while the order is prepared, shipped, tracking is submitted, and shipment information is reviewed.",
      "Archery Outlet may review carrier, tracking number, shipment timing, order details, and other marketplace records before releasing seller payout.",
    ],
  },
  {
    title: "Invalid or missing tracking",
    body: [
      "If tracking information is missing, incorrect, invalid, does not show movement, or appears suspicious, Archery Outlet may delay payout release while the issue is reviewed.",
      "Sellers may be asked to provide updated tracking information, proof of shipment, carrier receipts, photos, or other shipment details.",
    ],
  },
  {
    title: "Delivery issues",
    body: [
      "If a package is delayed, lost, damaged, marked delivered but not received, or has another delivery issue, Archery Outlet may review the order details, tracking information, buyer and seller communication, and any available shipment records.",
      "Buyers should report delivery problems quickly so the issue can be reviewed before seller payout is released whenever possible.",
    ],
  },
  {
    title: "Buyer shipping information",
    body: [
      "Buyers are responsible for providing accurate checkout and shipping information.",
      "If a buyer provides incorrect shipping information, delivery may be delayed or unsuccessful, and refund options may be limited depending on the situation.",
    ],
  },
  {
    title: "Shipping support",
    body: [
      "Shipping questions or order shipment problems can be sent to support@archeryoutlet.net.",
      "When contacting support, include the order details, listing title, tracking number, carrier, and a clear explanation of the issue.",
    ],
  },
];

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
            This policy explains shipping requirements, tracking, shipment
            review, and seller payout timing for Archery Outlet orders.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-7 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5 text-sm font-bold leading-6 text-stone-700">
            This Shipping Policy explains seller shipping expectations,
            tracking requirements, and shipment review.
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
            Shipping questions can be sent to support@archeryoutlet.net.
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
