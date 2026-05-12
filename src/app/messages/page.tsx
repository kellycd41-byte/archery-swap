"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type MessageRecord = {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type ListingSummary = {
  id: string;
  title: string;
  status: string;
};

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
            <Link href="/messages" className="text-emerald-300">
              Messages
            </Link>
            <Link href="/account" className="hover:text-emerald-300">
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
                className="block border-b border-stone-800 bg-stone-800 px-4 py-3 text-sm font-bold text-emerald-300"
              >
                Messages
              </Link>
              <Link
                href="/account"
                className="block px-4 py-3 text-sm font-bold hover:bg-stone-800"
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

function formatMessageDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getListingTitle(
  listingId: string,
  listingMap: Record<string, ListingSummary>
) {
  return listingMap[listingId]?.title || "Listing";
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [listingMap, setListingMap] = useState<Record<string, ListingSummary>>(
    {}
  );

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadMessages(currentUser: User) {
    setIsLoadingMessages(true);
    setErrorMessage("");

    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .select("id,listing_id,sender_id,receiver_id,body,read_at,created_at")
      .order("created_at", { ascending: false });

    if (messageError) {
      setMessages([]);
      setListingMap({});
      setErrorMessage(messageError.message);
      setIsLoadingMessages(false);
      return;
    }

    const loadedMessages = (messageData || []) as MessageRecord[];
    setMessages(loadedMessages);

    const uniqueListingIds = Array.from(
      new Set(
        loadedMessages
          .map((message) => message.listing_id)
          .filter((listingId) => listingId)
      )
    );

    if (uniqueListingIds.length === 0) {
      setListingMap({});
      setIsLoadingMessages(false);
      return;
    }

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("id,title,status")
      .in("id", uniqueListingIds);

    if (listingError) {
      setListingMap({});
      setErrorMessage(listingError.message);
      setIsLoadingMessages(false);
      return;
    }

    const nextListingMap: Record<string, ListingSummary> = {};

    ((listingData || []) as ListingSummary[]).forEach((listing) => {
      nextListingMap[listing.id] = listing;
    });

    setListingMap(nextListingMap);
    setIsLoadingMessages(false);
  }

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const signedInUser = data.session?.user ?? null;

      setUser(signedInUser);
      setIsLoadingSession(false);

      if (signedInUser) {
        loadMessages(signedInUser);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const signedInUser = session?.user ?? null;

      setUser(signedInUser);

      if (signedInUser) {
        loadMessages(signedInUser);
      } else {
        setMessages([]);
        setListingMap({});
        setErrorMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Messages
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Your Archery Swap messages.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            Messages are connected to listings so buyers and sellers know
            exactly which item they are discussing.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          {isLoadingSession ? (
            <div className="rounded-3xl border border-stone-300 bg-stone-50 p-6">
              <p className="font-black">Checking sign-in status...</p>
            </div>
          ) : !user ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
                Sign In Required
              </p>

              <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950">
                Sign in to view messages.
              </h3>

              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
                Your inbox is private. Sign in to see messages you have sent or
                received about listings.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Link
                  href="/account"
                  className="rounded-2xl bg-emerald-600 px-5 py-4 text-center text-sm font-black text-white hover:bg-emerald-500"
                >
                  Sign In or Create Account
                </Link>

                <Link
                  href="/browse"
                  className="rounded-2xl bg-stone-950 px-5 py-4 text-center text-sm font-black text-white hover:bg-stone-800"
                >
                  Browse Gear
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
                      Inbox
                    </p>

                    <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950">
                      Messages for your account.
                    </h3>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
                      Signed in as{" "}
                      <span className="font-black">{user.email}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadMessages(user)}
                    disabled={isLoadingMessages}
                    className="cursor-pointer rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-950 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingMessages ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {errorMessage ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                  {errorMessage}
                </div>
              ) : null}

              {isLoadingMessages ? (
                <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                  <p className="font-bold text-stone-700">
                    Loading messages...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                  <p className="font-black">No messages yet.</p>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    When you send a message to a seller, or someone messages you
                    about your listing, it will appear here.
                  </p>

                  <Link
                    href="/browse"
                    className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500"
                  >
                    Browse Gear
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {messages.map((message) => {
                    const isSentByMe = message.sender_id === user.id;
                    const listingTitle = getListingTitle(
                      message.listing_id,
                      listingMap
                    );

                    return (
                      <article
                        key={message.id}
                        className="rounded-2xl border border-stone-300 bg-stone-50 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
                                isSentByMe
                                  ? "bg-stone-200 text-stone-800"
                                  : "bg-emerald-100 text-emerald-900"
                              }`}
                            >
                              {isSentByMe ? "Sent" : "Received"}
                            </span>

                            <h4 className="mt-3 text-lg font-black">
                              {listingTitle}
                            </h4>

                            <p className="mt-1 text-sm font-bold text-stone-500">
                              {formatMessageDate(message.created_at)}
                            </p>
                          </div>

                          <Link
                            href={`/listing/${message.listing_id}`}
                            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-black hover:bg-stone-100"
                          >
                            View Listing
                          </Link>
                        </div>

                        <p className="mt-4 whitespace-pre-line rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-stone-700">
                          {message.body}
                        </p>

                        <p className="mt-3 text-xs font-bold leading-5 text-stone-500">
                          Reply tools are coming next. For now, this page shows
                          messages that were sent from listing pages.
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 rounded-2xl bg-stone-100 p-5">
                <h3 className="text-xl font-black">Current status</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                  <li>• Buyers can send messages from listing pages.</li>
                  <li>• Sellers can view received messages here.</li>
                  <li>• Buyers can view sent messages here.</li>
                  <li>• Reply tools will be added next.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <aside className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-2xl font-black">Messaging notes</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Listing context</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Each message is attached to a listing so the conversation starts
                with the right item.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Private inbox</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                You only see messages where you are the sender or receiver.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-5">
              <p className="font-black">Replies coming next</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                This first inbox shows messages. The next step will let buyers
                and sellers reply from this page.
              </p>
            </div>

            <div className="rounded-2xl bg-stone-950 p-5 text-white">
              <p className="font-black text-emerald-300">Safety reminder</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Be careful with payment, pickup, and shipping arrangements until
                checkout tools are built.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/account"
              className="rounded-xl border border-stone-300 px-4 py-3 text-center font-black hover:bg-stone-100"
            >
              View Account Page
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