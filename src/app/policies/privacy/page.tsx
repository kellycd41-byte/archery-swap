import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  {
    title: "Information Archery Outlet may collect",
    body: [
      "Archery Outlet may collect information you provide when you create an account, sign in, create listings, upload photos, send messages, make offers, buy items, sell items, submit shipping information, leave reviews, contact support, or otherwise use the marketplace.",
      "This information may include your name, email address, listing details, listing photos, item descriptions, prices, shipping costs, location information you choose to provide, messages, offers, order details, buyer phone number from checkout, shipping carrier, tracking number, seller reviews, and support communications.",
    ],
  },
  {
    title: "Account and sign-in information",
    body: [
      "Account sign-in is used so buyers and sellers can manage listings, offers, messages, orders, reviews, and seller activity.",
      "You are responsible for keeping your account access secure. If you believe your account has been accessed without permission, contact Archery Outlet as soon as possible.",
    ],
  },
  {
    title: "Listings and marketplace activity",
    body: [
      "Listing information may be shown publicly on the marketplace after review and approval. This may include listing title, description, photos, price, shipping cost, category, condition, seller name, location information you choose to provide, and seller review information.",
      "Archery Outlet may use listing, offer, message, order, and review activity to operate the marketplace, prevent fraud, review disputes, enforce policies, improve safety, and support buyers and sellers.",
    ],
  },
  {
    title: "Messages, offers, orders, and reviews",
    body: [
      "Messages, offers, orders, shipping details, and seller reviews may be stored so the marketplace can function and so buyers, sellers, and Archery Outlet can review transaction history.",
      "Archery Outlet may review marketplace records when investigating order problems, payment issues, shipping issues, refund requests, disputes, suspicious activity, policy concerns, or support requests.",
    ],
  },
  {
    title: "Payments and seller payouts",
    body: [
      "Payments, checkout, and seller payout setup are handled through Stripe. Archery Outlet should not store full payment card numbers.",
      "Archery Outlet may store payment-related marketplace records such as checkout session IDs, payment intent IDs, charge IDs, connected seller account IDs, transfer IDs, order amounts, platform fees, seller payout amounts, payout release status, and refund or dispute-related information when needed to operate the marketplace.",
    ],
  },
  {
    title: "Shipping information",
    body: [
      "Shipping information may be used to complete orders, notify buyers and sellers, review shipment status, handle support requests, and decide whether seller payout should be released.",
      "This may include shipping carrier, tracking number, shipment date, buyer phone number collected during checkout, and other order-related information.",
    ],
  },
  {
    title: "Email notifications",
    body: [
      "Archery Outlet may send marketplace emails related to account activity, orders, sold items, shipping updates, tracking information, payout release, support, policy issues, and other important marketplace activity.",
      "Transactional emails are used to operate the marketplace and may be sent even if marketing emails are not used.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "Archery Outlet may use trusted service providers to operate the marketplace, including services for hosting, database storage, authentication, payments, seller payouts, email delivery, and other site operations.",
      "These providers may process information as needed to provide their services to Archery Outlet.",
    ],
  },
  {
    title: "How information may be shared",
    body: [
      "Some information is shared between buyers and sellers as needed to complete a transaction. For example, sellers may see order and shipment-related information, and buyers may see tracking information and seller review information.",
      "Archery Outlet may share information when needed to operate the marketplace, comply with legal obligations, protect users, prevent fraud, enforce policies, process payments, review disputes, or respond to support requests.",
    ],
  },
  {
    title: "Data security",
    body: [
      "Archery Outlet works to limit access to marketplace information to the access needed to operate, support, and protect the site.",
      "No online service can guarantee perfect security. Users should protect their login information and avoid sharing sensitive information unnecessarily in listings or messages.",
    ],
  },
  {
    title: "Data updates and deletion requests",
    body: [
      "Users may update certain account, listing, and marketplace information through the site. Some order, payment, shipping, review, and dispute records may need to be kept for marketplace records, support, fraud prevention, tax, accounting, legal, or safety reasons.",
      "Questions about privacy or account information can be sent to support@archeryoutlet.net.",
    ],
  },
  {
    title: "Policy updates",
    body: [
      "Archery Outlet may update this Privacy Policy as the marketplace changes, new features are added, or legal and operational requirements change.",
      "Continued use of Archery Outlet after updates means you accept the updated Privacy Policy.",
    ],
  },
];

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
            This Privacy Policy explains the information used to operate
            accounts, listings, offers, messages, orders, shipping, payouts,
            reviews, and support for Archery Outlet.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-7 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5 text-sm font-bold leading-6 text-stone-700">
            This Privacy Policy explains how information may be used to operate
            and protect the Archery Outlet marketplace.
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
            Privacy questions can be sent to support@archeryoutlet.net.
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
