export default function Home() {
  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-emerald-300">
          Archery Gear Marketplace
        </p>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
          Buy and sell archery gear with confidence.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
          Archery Swap is a rugged but clean marketplace for bows, crossbows,
          arrows, sights, releases, cases, targets, and accessories.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-500">
            Browse Gear
          </button>

          <button className="rounded-xl border border-stone-600 px-6 py-3 font-bold text-white hover:bg-stone-900">
            Sell Your Gear
          </button>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-stone-900 p-6">
            <h2 className="text-xl font-bold">Bows & Crossbows</h2>
            <p className="mt-2 text-stone-400">
              Compound bows, recurve bows, crossbows, and full packages.
            </p>
          </div>

          <div className="rounded-2xl bg-stone-900 p-6">
            <h2 className="text-xl font-bold">Sights & Releases</h2>
            <p className="mt-2 text-stone-400">
              Upgrade your setup with trusted used and new accessories.
            </p>
          </div>

          <div className="rounded-2xl bg-stone-900 p-6">
            <h2 className="text-xl font-bold">Arrows & Gear</h2>
            <p className="mt-2 text-stone-400">
              Arrows, rests, stabilizers, cases, targets, and more.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}