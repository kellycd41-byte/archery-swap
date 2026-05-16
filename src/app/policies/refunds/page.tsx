import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  {
    title: "Refund review overview",
    body: [
      "Archery Outlet may review refund requests when an order has a serious issue. Refunds are not automatic and are not guaranteed in every situation.",
      "Refund decisions may depend on the listing details, order records, payment status, shipment status, tracking information, buyer and seller communication, seller payout status, and other marketplace records.",
    ],
  },
  {
    title: "When a refund may be reviewed",
    body: [
      "A refund request may be reviewed if the seller does not ship the item, tracking information is missing or invalid, the wrong item is sent, the item is materially different from the listing, the order appears fraudulent, or another serious order issue is reported.",
      "A buyer changing their mind, not reading the listing, or deciding they no longer want the item may not qualify for a refund.",
    ],
  },
  {
    title: "Seller payout hold",
    body: [
      "Seller payout is not released automatically at checkout. Seller payout may be held while the order is prepared, shipped, tracking is submitted, and shipment information is reviewed.",
      "This payout hold gives Archery Outlet time to review order issues before seller funds are released.",
    ],
  },
  {
    title: "Before seller payout is released",
    body: [
      "If a serious order issue is reported before seller payout is released, Archery Outlet may pause payout review while the issue is reviewed.",
      "Depending on the situation, Archery Outlet may request more information from the buyer, seller, or both. This may include photos, messages, tracking details, delivery information, packaging information, or other order details.",
    ],
  },
  {
    title: "After seller payout is released",
    body: [
      "After seller payout has been released, some refund situations may be harder to resolve. Archery Outlet may still review the issue, but payout release may affect available options.",
      "Buyers should report order problems as soon as possible so issues can be reviewed before payout release whenever possible.",
    ],
  },
  {
    title: "Buyer responsibilities",
    body: [
      "Buyers should review listing photos, title, description, condition, item details, seller reviews, item price, shipping cost, and checkout information before purchasing.",
      "Buyers should provide accurate checkout and shipping information and should contact Archery Outlet quickly if an order problem occurs.",
    ],
  },
  {
    title: "Seller responsibilities",
    body: [
      "Sellers should describe items honestly, upload clear photos, disclose important condition issues, ship promptly, package items safely, and provide valid carrier and tracking information.",
      "Sellers should keep proof of shipment and respond to support requests if an order issue is reported.",
    ],
  },
  {
    title: "Shipping and tracking problems",
    body: [
      "If tracking is not provided, tracking is invalid, the package does not show movement, or the shipment appears to have a delivery issue, Archery Outlet may review the order before payout is released.",
      "Archery Outlet may use tracking details, order records, and buyer and seller communication to decide what action is appropriate.",
    ],
  },
  {
    title: "Item condition or listing problems",
    body: [
      "If a buyer reports that an item is materially different from the listing, Archery Outlet may review the listing photos, description, messages, buyer photos, seller information, and other marketplace records.",
      "Normal used-item wear that was shown or described in the listing may not qualify for a refund.",
    ],
  },
  {
    title: "Return shipping",
    body: [
      "If a return is approved, Archery Outlet may provide instructions about whether the item must be returned, where it should be returned, and who is responsible for return shipping.",
      "Buyers should not return an item without instructions if they are asking Archery Outlet to review the issue.",
    ],
  },
  {
    title: "Refund amount",
    body: [
      "Refund amounts may vary depending on the situation. A refund may include some or all of the item amount, shipping amount, fees, or other order-related amounts when appropriate.",
      "Payment processor timing and bank timing may affect when a refund appears after it is issued.",
    ],
  },
  {
    title: "How to report an order problem",
    body: [
      "To report an order problem, contact support@archeryoutlet.net with the order details, listing title, a clear description of the issue, and any helpful photos, tracking information, or messages.",
      "The sooner an issue is reported, the easier it may be to review before seller payout is released.",
    ],
  },
];

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
            This policy explains how Archery Outlet may review order problems,
            refund requests, shipping issues, and seller payout holds.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-7 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5 text-sm font-bold leading-6 text-stone-700">
            This Refund Policy explains how Archery Outlet may review order
            issues and refund requests.
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
            Refund and order issue questions can be sent to
            support@archeryoutlet.net.
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
