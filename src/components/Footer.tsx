import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-black tracking-tight">
            Archery Outlet
          </h2>

          <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
            Buy • Sell • Archery Gear
          </p>

          <p className="mt-5 max-w-xl leading-7 text-stone-300">
            A simple marketplace for buying and selling archery gear, with
            listing review, secure checkout, shipment tracking, and seller
            payout review built into the process.
          </p>

          <div className="mt-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-stone-400">
              Contact
            </p>

            <a
              href="mailto:support@archeryoutlet.net"
              className="mt-2 inline-block font-black text-emerald-300 hover:text-emerald-200"
            >
              support@archeryoutlet.net
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-400">
            Marketplace
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm font-bold text-stone-300">
            <Link href="/browse" className="hover:text-emerald-300">
              Browse Gear
            </Link>

            <Link href="/sell" className="hover:text-emerald-300">
              Sell Your Gear
            </Link>

            <Link href="/how-it-works" className="hover:text-emerald-300">
              How It Works
            </Link>

            <Link href="/account" className="hover:text-emerald-300">
              Account
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-400">
            Policies
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm font-bold text-stone-300">
            <Link href="/policies" className="hover:text-emerald-300">
              Policies Overview
            </Link>

            <Link href="/policies/terms" className="hover:text-emerald-300">
              Terms of Service
            </Link>

            <Link href="/policies/privacy" className="hover:text-emerald-300">
              Privacy Policy
            </Link>

            <Link href="/policies/refunds" className="hover:text-emerald-300">
              Refund Policy
            </Link>

            <Link href="/policies/shipping" className="hover:text-emerald-300">
              Shipping Policy
            </Link>

            <Link href="/policies/sellers" className="hover:text-emerald-300">
              Seller Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-stone-800 pt-6">
        <p className="text-sm font-bold text-stone-500">
          © {new Date().getFullYear()} Archery Outlet. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
