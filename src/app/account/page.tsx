"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function Header() {
  return (
    <header className="border-b border-stone-800 bg-stone-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              Archery Swap
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300 sm:text-xs">
              Buy • Sell • Archery Gear
            </p>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold md:flex">
            <Link href="/" className="hover:text-emerald-300">
              Home
            </Link>
            <Link href="/browse" className="hover:text-emerald-300">
              Browse Gear
            </Link>
            <Link href="/sell" className="hover:text-emerald-300">
              Sell Gear
            </Link>
            <Link href="/messages" className="hover:text-emerald-300">
              Messages
            </Link>
            <Link href="/account" className="text-emerald-300">
              Account
            </Link>
          </nav>

          <div className="hidden md:block">
            <Link
              href="/sell"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
            >
              Sell Your Gear
            </Link>
          </div>

          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-xl border border-stone-700 px-4 py-2 text-sm font-black text-white">
              Menu
            </summary>

            <div className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-2xl border border-stone-700 bg-stone-900 shadow-2xl">
              <Link
                href="/"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Home
              </Link>
              <Link
                href="/browse"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Browse Gear
              </Link>
              <Link
                href="/sell"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Sell Gear
              </Link>
              <Link
                href="/messages"
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Messages
              </Link>
              <Link
                href="/account"
                className="block bg-stone-800 px-4 py-3 text-sm font-bold text-emerald-300"
              >
                Account
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export default function AccountPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      setUser(data.session?.user ?? null);
      setIsLoadingSession(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    const cleanedEmail = email.trim();

    if (!cleanedEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (!cleanedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email: cleanedEmail,
        password,
      });

      setIsSubmitting(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.user && !data.session) {
        setMessage(
          "Account created. Please check your email to confirm your account, then come back and sign in."
        );
      } else {
        setMessage("Account created and signed in.");
        setUser(data.user);
      }

      setPassword("");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setUser(data.user);
    setMessage("You are signed in.");
    setPassword("");
  }

  async function handleSignOut() {
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signOut();

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setUser(null);
    setEmail("");
    setPassword("");
    setMessage("You are signed out.");
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Account
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Sign in to Archery Swap.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            Accounts are the foundation for seller profiles, real messaging,
            saved listings, offers, buying, and safer marketplace tools.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          {isLoadingSession ? (
            <div className="rounded-3xl border border-stone-300 bg-stone-50 p-6">
              <p className="font-black">Checking account status...</p>
            </div>
          ) : user ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
                Signed In
              </p>

              <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950">
                Your account is active.
              </h3>

              <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  Email
                </p>
                <p className="mt-2 break-words text-lg font-black text-stone-950">
                  {user.email}
                </p>
              </div>

              <p className="mt-5 max-w-2xl text-base leading-7 text-stone-700">
                This is the first step toward real buyer and seller accounts.
                Next we will connect listings to signed-in users, then build real
                messaging.
              </p>

              {message ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-bold text-emerald-900">
                  {message}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/sell"
                  className="rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500"
                >
                  List Gear
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-2xl bg-stone-950 px-5 py-4 text-center text-sm font-black text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-300 bg-stone-50 p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-in");
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-black ${
                    mode === "sign-in"
                      ? "bg-stone-950 text-white"
                      : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("sign-up");
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-black ${
                    mode === "sign-up"
                      ? "bg-stone-950 text-white"
                      : "border border-stone-300 bg-white text-stone-950 hover:bg-stone-100"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <h3 className="mt-6 text-3xl font-black tracking-tight text-stone-950">
                {mode === "sign-in"
                  ? "Sign in to your account."
                  : "Create your account."}
              </h3>

              <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">
                {mode === "sign-in"
                  ? "Use your email and password to sign in."
                  : "Create an account with your email and a password. Passwords must be at least 6 characters."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-black">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                {message ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                    {message}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Working..."
                    : mode === "sign-in"
                      ? "Sign In"
                      : "Create Account"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Seller profiles</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Sellers will be able to manage their profile, location, contact
                preferences, and gear listings.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Saved gear</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Buyers will be able to save listings and return to gear they are
                interested in later.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="text-lg font-black">Listing control</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Users will eventually be able to view, update, pause, and manage
                their own active listings.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-stone-100 p-5">
            <h3 className="text-xl font-black">Current status</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
              <li>• Browsing approved listings works now.</li>
              <li>• Submitting listings for review works now.</li>
              <li>• Admin approval tools work now.</li>
              <li>• Account sign-up and sign-in are being added now.</li>
            </ul>
          </div>
        </div>

        <aside className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-2xl font-black">What accounts unlock</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Real messaging</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Account sign-in will let messages connect to the correct buyer,
                seller, and listing.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Offers and buying</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Accounts are needed before buyers can make offers, buy gear, and
                manage order history.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Saved listings</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Buyers will be able to save gear and return to listings they are
                considering.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950 p-5 text-white">
              <p className="font-black text-emerald-300">Next foundation step</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                After this works, we will connect new listings to the signed-in
                seller account.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/messages"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              View Messages Page
            </Link>

            <Link
              href="/browse"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              Browse Gear
            </Link>

            <Link
              href="/sell"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              Sell Gear
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}