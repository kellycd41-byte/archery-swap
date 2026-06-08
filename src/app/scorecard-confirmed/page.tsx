export default function ScorecardConfirmedPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#ded7ca] bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-black uppercase tracking-wide text-[#2f6b43]">
          Archery &amp; 3D Scorecard
        </p>

        <h1 className="mb-4 text-4xl font-black text-[#1f3b2d]">
          Email Confirmed
        </h1>

        <p className="mb-4 text-lg font-bold leading-8 text-[#5b5248]">
          Your Archery &amp; 3D Scorecard account has been confirmed.
        </p>

        <p className="mb-6 text-base font-semibold leading-7 text-[#5b5248]">
          You can now close this page, open the Archery &amp; 3D Scorecard app,
          and log in with your email and password.
        </p>

        <div className="rounded-2xl bg-[#f4f1ea] p-5">
          <p className="text-sm font-black uppercase tracking-wide text-[#1f3b2d]">
            Next step
          </p>
          <p className="mt-2 text-base font-bold leading-7 text-[#5b5248]">
            Return to the app on your phone and tap Log In.
          </p>
        </div>
      </div>
    </main>
  );
}
