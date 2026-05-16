import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  {
    title: "Using Archery Outlet",
    body: [
      "Archery Outlet is an online marketplace for buying and selling archery gear. By using the site, creating an account, listing gear, making offers, sending messages, buying items, or selling items, you agree to use the marketplace honestly and responsibly.",
      "You are responsible for the information you provide, including account information, listing details, photos, prices, shipping costs, payment information, payout information, messages, tracking details, and any other information submitted through the site.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "You are responsible for keeping your account login information secure. Any activity that happens through your account may be treated as activity by you.",
      "Archery Outlet may limit, suspend, or remove access to an account if the account appears to be used for fraud, abuse, spam, unsafe activity, prohibited listings, payment issues, or activity that creates risk for buyers, sellers, or the marketplace.",
    ],
  },
  {
    title: "Listings",
    body: [
      "Sellers must create honest and accurate listings. Listings should include clear photos, a truthful description, correct item condition, accurate price, accurate shipping cost, and any important details a buyer should know before purchasing.",
      "Listings are reviewed before they are posted publicly. Archery Outlet may approve, deny, edit, remove, or hide listings that appear inaccurate, unsafe, incomplete, prohibited, suspicious, or not appropriate for the marketplace.",
    ],
  },
  {
    title: "Buying",
    body: [
      "Buyers are responsible for reviewing the listing title, photos, description, condition, item price, shipping cost, seller information, and seller reviews before purchasing.",
      "Buyers should complete purchases through Archery Outlet checkout. Buyers should not send payment outside the marketplace for an item listed on Archery Outlet.",
    ],
  },
  {
    title: "Offers",
    body: [
      "Sellers may allow buyers to make offers on listings. If a seller accepts an offer, the buyer must still complete checkout before the listing is marked sold.",
      "A listing is not sold only because an offer is accepted. A listing is marked sold after payment is completed and confirmed.",
    ],
  },
  {
    title: "Orders and payment",
    body: [
      "Buyers pay through checkout. The buyer may pay the item price plus shipping. Archery Outlet may collect a marketplace fee from the seller payout.",
      "Seller payout is not released automatically at checkout. Seller funds may be held while the order is prepared, shipped, tracking is submitted, and the shipment is reviewed.",
      "Archery Outlet may delay, cancel, refund, or hold an order or payout if there is a payment issue, shipping issue, tracking issue, dispute, suspected fraud, policy concern, or other marketplace risk.",
    ],
  },
  {
    title: "Shipping",
    body: [
      "Sellers are responsible for shipping sold items promptly and adding accurate carrier and tracking information to the order.",
      "Tracking information may be reviewed before seller payout is released. Sellers should package items carefully and keep proof of shipment.",
      "Buyers are responsible for providing accurate shipping information during checkout.",
    ],
  },
  {
    title: "Seller payouts",
    body: [
      "Seller payout amounts may reflect the item amount, shipping amount, marketplace fee, payment processing activity, refunds, adjustments, or other order-related amounts.",
      "A seller payout may be released only after Archery Outlet reviews the order and shipment information. Bank timing and Stripe payout timing may vary after a payout is released.",
    ],
  },
  {
    title: "Reviews",
    body: [
      "Buyers may be able to leave a seller review after a completed order. Reviews should be honest, relevant to the transaction, and based on the buyer's actual experience.",
      "Archery Outlet may remove or limit reviews that appear abusive, fake, misleading, unrelated, or inappropriate.",
    ],
  },
  {
    title: "Disputes, refunds, and order problems",
    body: [
      "If an order has a problem, buyers and sellers should contact Archery Outlet as soon as possible. Order issues may include failure to ship, incorrect tracking, damaged items, missing items, inaccurate listings, or other transaction concerns.",
      "Archery Outlet may review messages, listing information, order details, tracking information, payment information, and other marketplace records when reviewing an order problem.",
      "Refunds are not guaranteed in every situation. Refund decisions may depend on the order status, shipment status, tracking information, buyer and seller communication, marketplace records, and other relevant details.",
    ],
  },
  {
    title: "Prohibited or restricted activity",
    body: [
      "Users may not use Archery Outlet for fraud, scams, harassment, spam, payment avoidance, fee avoidance, false listings, fake reviews, stolen goods, unsafe activity, or activity that violates marketplace rules.",
      "Users may not interfere with the site, attempt unauthorized access, misuse another user's information, or use the marketplace in a way that harms buyers, sellers, Archery Outlet, or the marketplace.",
    ],
  },
  {
    title: "Changes to the marketplace",
    body: [
      "Archery Outlet may update site features, fees, listing rules, order processes, payout processes, review features, policies, or other marketplace operations over time.",
      "These terms may be updated as the marketplace changes. Continued use of Archery Outlet after updates means you accept the updated terms.",
    ],
  },
];

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
            These terms explain the basic rules for accounts, listings, orders,
            shipping, seller payouts, reviews, and marketplace use.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-7 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-6 text-amber-900">
            These policies are general marketplace terms for Archery Outlet and
            should be reviewed by a qualified professional before launch.
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
            Questions about these terms can be sent to
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
