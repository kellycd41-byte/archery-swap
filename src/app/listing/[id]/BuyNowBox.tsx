type BuyNowBoxProps = {
  listingTitle: string;
};

export default function BuyNowBox({ listingTitle }: BuyNowBoxProps) {
  return (
    <div className="mt-6 rounded-3xl border border-stone-300 bg-stone-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
        Secure checkout coming soon
      </p>

      <h3 className="mt-3 text-2xl font-black">Buy this item</h3>

      <p className="mt-2 text-sm font-bold leading-6 text-stone-700">
        Buy Now will eventually let buyers pay through Archery Swap for{" "}
        {listingTitle}. For now, use messages or make an offer before arranging
        payment, pickup, or shipping.
      </p>

      <button
        type="button"
        disabled
        className="mt-5 w-full cursor-not-allowed rounded-2xl bg-stone-400 px-5 py-4 text-sm font-black text-white"
      >
        Buy Now Coming Soon
      </button>

      <p className="mt-3 text-xs font-bold leading-5 text-stone-500">
        Checkout is not active yet. Do not send payment through links from
        unknown users.
      </p>
    </div>
  );
}