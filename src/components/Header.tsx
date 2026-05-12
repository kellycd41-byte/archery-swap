"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ActivePage = "home" | "browse" | "sell" | "messages" | "account";

type HeaderProps = {
  activePage?: ActivePage;
};

function MessageBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      aria-label="Unread messages"
      className="ml-2 h-2.5 w-2.5 rounded-full bg-emerald-400"
    />
  );
}

export default function Header({ activePage }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadUnreadCount() {
    const { data: sessionData } = await supabase.auth.getSession();
    const signedInUser = sessionData.session?.user ?? null;

    if (!signedInUser) {
      setUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", signedInUser.id)
      .is("read_at", null);

    if (error) {
      setUnreadCount(0);
      return;
    }

    setUnreadCount(count || 0);
  }

  useEffect(() => {
    loadUnreadCount();

    const handleUnreadChange = () => {
      loadUnreadCount();
    };

    const handleWindowFocus = () => {
      loadUnreadCount();
    };

    window.addEventListener("archery-swap-unread-changed", handleUnreadChange);
    window.addEventListener("focus", handleWindowFocus);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUnreadCount();
    });

    return () => {
      window.removeEventListener(
        "archery-swap-unread-changed",
        handleUnreadChange
      );
      window.removeEventListener("focus", handleWindowFocus);
      subscription.unsubscribe();
    };
  }, []);

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
            <Link
              href="/"
              className={
                activePage === "home"
                  ? "text-emerald-300"
                  : "hover:text-emerald-300"
              }
            >
              Home
            </Link>

            <Link
              href="/browse"
              className={
                activePage === "browse"
                  ? "text-emerald-300"
                  : "hover:text-emerald-300"
              }
            >
              Browse Gear
            </Link>

            <Link
              href="/sell"
              className={
                activePage === "sell"
                  ? "text-emerald-300"
                  : "hover:text-emerald-300"
              }
            >
              Sell Gear
            </Link>

            <Link
              href="/messages"
              className={`inline-flex items-center ${
                activePage === "messages"
                  ? "text-emerald-300"
                  : "hover:text-emerald-300"
              }`}
            >
              Messages
              <MessageBadge count={unreadCount} />
            </Link>

            <Link
              href="/account"
              className={
                activePage === "account"
                  ? "text-emerald-300"
                  : "hover:text-emerald-300"
              }
            >
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
                className={`block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800 ${
                  activePage === "home" ? "text-emerald-300" : ""
                }`}
              >
                Home
              </Link>

              <Link
                href="/browse"
                className={`block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800 ${
                  activePage === "browse" ? "text-emerald-300" : ""
                }`}
              >
                Browse Gear
              </Link>

              <Link
                href="/sell"
                className={`block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800 ${
                  activePage === "sell" ? "text-emerald-300" : ""
                }`}
              >
                Sell Gear
              </Link>

              <Link
                href="/messages"
                className={`flex items-center border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800 ${
                  activePage === "messages"
                    ? "bg-stone-800 text-emerald-300"
                    : ""
                }`}
              >
                Messages
                <MessageBadge count={unreadCount} />
              </Link>

              <Link
                href="/account"
                className={`block px-4 py-3 text-sm font-bold hover:bg-stone-800 ${
                  activePage === "account" ? "text-emerald-300" : ""
                }`}
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