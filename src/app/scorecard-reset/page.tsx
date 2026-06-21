"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PageState = "checking" | "ready" | "invalid" | "saving" | "success";

export default function ScorecardResetPage() {
  const [pageState, setPageState] = useState<PageState>("checking");
  const [message, setMessage] = useState(
    "Checking your password reset link..."
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session) {
        setPageState("ready");
        setMessage("");
        return;
      }

      setPageState("invalid");
      setMessage(
        "This password reset link is invalid, expired, or has already been used. Please return to the app and request a new password reset email."
      );
    }

    void checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setPageState("ready");
        setMessage("");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("Please use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your new passwords do not match.");
      return;
    }

    setPageState("saving");
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setPageState("ready");
      setMessage(
        error.message ||
          "We could not update your password. Please request a new reset email and try again."
      );
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setPageState("success");
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#ded7ca] bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-black uppercase tracking-wide text-[#2f6b43]">
          Archery &amp; 3D Scorecard
        </p>

        <h1 className="mb-4 text-4xl font-black text-[#1f3b2d]">
          Reset Your Password
        </h1>

        {pageState === "checking" ? (
          <p className="text-base font-semibold leading-7 text-[#5b5248]">
            {message}
          </p>
        ) : null}

        {pageState === "invalid" ? (
          <div className="rounded-2xl border border-[#d9b7ae] bg-[#fff7f5] p-5">
            <p className="text-base font-bold leading-7 text-[#7a3326]">
              {message}
            </p>
          </div>
        ) : null}

        {pageState === "success" ? (
          <>
            <p className="mb-6 text-lg font-bold leading-8 text-[#5b5248]">
              Your password has been updated successfully.
            </p>

            <div className="rounded-2xl bg-[#f4f1ea] p-5">
              <p className="text-sm font-black uppercase tracking-wide text-[#1f3b2d]">
                Next step
              </p>
              <p className="mt-2 text-base font-bold leading-7 text-[#5b5248]">
                Return to the Archery &amp; 3D Scorecard app and sign in with
                your email and new password.
              </p>
            </div>
          </>
        ) : null}

        {pageState === "ready" || pageState === "saving" ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <p className="text-base font-semibold leading-7 text-[#5b5248]">
              Choose a new password for your Archery &amp; 3D Scorecard
              account.
            </p>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-[#1f3b2d]">
                New password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pageState === "saving"}
                className="w-full rounded-xl border border-[#cfc6b7] px-4 py-3 text-base text-[#1f3b2d] outline-none transition focus:border-[#2f6b43] focus:ring-2 focus:ring-[#b9d7c2]"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-[#1f3b2d]">
                Confirm new password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                disabled={pageState === "saving"}
                className="w-full rounded-xl border border-[#cfc6b7] px-4 py-3 text-base text-[#1f3b2d] outline-none transition focus:border-[#2f6b43] focus:ring-2 focus:ring-[#b9d7c2]"
                placeholder="Type the same password again"
                minLength={8}
                required
              />
            </label>

            {message ? (
              <div className="rounded-2xl border border-[#d9b7ae] bg-[#fff7f5] p-4">
                <p className="text-sm font-bold leading-6 text-[#7a3326]">
                  {message}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={pageState === "saving"}
              className="w-full rounded-xl bg-[#1f3b2d] px-5 py-3 text-base font-black text-white transition hover:bg-[#2f6b43] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pageState === "saving"
                ? "Updating Password..."
                : "Update Password"}
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
