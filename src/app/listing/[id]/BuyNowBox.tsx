type BuyNowBoxProps = {
  listingTitle: string;
};

export default function BuyNowBox({ listingTitle }: BuyNowBoxProps) {
  return (
    <div className="mt-4 rounded-2xl border border-stone-300 bg-stone-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
            Checkout coming soon
          </p>

          <h3 className="mt-2 text-xl font-black">Buy Now</h3>
        </div>

        <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-black text-stone-700">
          Disabled
        </span>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-stone-700">
        Secure checkout is not active yet for {listingTitle}.
      </p>

      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-xl bg-stone-400 px-5 py-3 text-sm font-black text-white"
      >
        Buy Now Coming Soon
      </button>
    </div>
  );
}