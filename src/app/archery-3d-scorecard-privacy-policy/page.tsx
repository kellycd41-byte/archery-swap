export default function Archery3DScorecardPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900">
      <div className="mx-auto mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Archery &amp; 3D Scorecard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Effective Date: May 24, 2026
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 text-base leading-7 text-slate-700">
        <section>
          <p>
            Archery &amp; 3D Scorecard respects your privacy. This Privacy
            Policy explains what information the app collects, how it is used,
            and how you can contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Information We Collect
          </h2>
          <p className="mt-3">
            Archery &amp; 3D Scorecard may collect or store the following
            information:
          </p>

          <h3 className="mt-5 font-semibold text-slate-900">
            Account Information
          </h3>
          <p className="mt-2">
            If you create an account or log in, your email address and password
            login are handled through Supabase authentication. We do not store
            your password directly in the app.
          </p>

          <h3 className="mt-5 font-semibold text-slate-900">
            Scorecard Information
          </h3>
          <p className="mt-2">
            The app saves scorecard data such as shooter names, scores, target
            counts, scoring type, shoot type, locations, yardages, notes, dates,
            and scorecard history.
          </p>

          <h3 className="mt-5 font-semibold text-slate-900">
            Target Photos
          </h3>
          <p className="mt-2">
            If you choose to take or save target photos, those photos may be
            stored with your scorecard data. The camera is used only when you
            choose to add a target photo.
          </p>

          <h3 className="mt-5 font-semibold text-slate-900">
            Cloud Backup Data
          </h3>
          <p className="mt-2">
            If you use cloud backup or restore, your saved scorecards and
            related scorecard data may be backed up through Supabase so you can
            restore them later.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            How We Use Information
          </h2>
          <p className="mt-3">We use information only to provide app features, including:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Creating and saving scorecards</li>
            <li>Showing saved scorecard history</li>
            <li>Tracking scores and stats</li>
            <li>Backing up and restoring scorecards</li>
            <li>Exporting PDF reports</li>
            <li>Printing scorecards</li>
            <li>Helping with support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Camera Use</h2>
          <p className="mt-3">
            Archery &amp; 3D Scorecard asks for camera access only so you can add
            target photos to scorecards. The camera is not used for advertising,
            tracking, or background collection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">PDF and Print</h2>
          <p className="mt-3">
            Target photos do not appear directly in printed scorecards or PDF
            reports. If a target has a photo, the PDF or printed report may say:
            “Target picture available.”
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Sharing Information
          </h2>
          <p className="mt-3">We do not sell your personal information.</p>
          <p className="mt-3">
            We may use trusted service providers, such as Supabase, to provide
            login, database, backup, and restore features. These services are
            used only to operate the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Data Storage</h2>
          <p className="mt-3">
            Scorecards are saved locally on your device. If you use cloud backup,
            scorecard data may also be stored in the cloud under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Data Deletion</h2>
          <p className="mt-3">
            You can delete saved scorecards inside the app. For help with account
            or cloud backup deletion requests, contact:
          </p>
          <p className="mt-3">
            <a
              href="mailto:support@archeryoutlet.net"
              className="font-semibold text-emerald-700 underline"
            >
              support@archeryoutlet.net
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Children&apos;s Privacy
          </h2>
          <p className="mt-3">
            Archery &amp; 3D Scorecard is intended for general archery
            scorekeeping. It is not designed to knowingly collect personal
            information from children without appropriate permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">
            Changes to This Policy
          </h2>
          <p className="mt-3">
            We may update this Privacy Policy from time to time. Updates will be
            posted with a new effective date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
          <p className="mt-3">For questions or support, contact:</p>
          <p className="mt-3">
            <a
              href="mailto:support@archeryoutlet.net"
              className="font-semibold text-emerald-700 underline"
            >
              support@archeryoutlet.net
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
