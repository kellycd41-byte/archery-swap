"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
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

type Conversation = {
  id: string;
  listing_id: string;
  other_user_id: string;
  listingTitle: string;
  listingStatus: string;
  lastMessage: MessageRecord;
  messages: MessageRecord[];
  unreadCount: number;
};

type ReplyStatus = {
  type: "success" | "error";
  text: string;
};

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

function formatShortDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getListingTitle(
  listingId: string,
  listingMap: Record<string, ListingSummary>
) {
  return listingMap[listingId]?.title || "Listing";
}

function getListingStatus(
  listingId: string,
  listingMap: Record<string, ListingSummary>
) {
  return listingMap[listingId]?.status || "unknown";
}

function formatListingStatus(status: string) {
  if (status === "active") {
    return "Active";
  }

  if (status === "pending") {
    return "Pending Review";
  }

  if (status === "denied") {
    return "Denied";
  }

  if (status === "inactive") {
    return "Inactive";
  }

  if (status === "sold") {
    return "Sold";
  }

  return "Listing";
}

function getConversationId(message: MessageRecord, currentUserId: string) {
  const otherUserId =
    message.sender_id === currentUserId ? message.receiver_id : message.sender_id;

  return `${message.listing_id}-${otherUserId}`;
}

function getOtherUserId(message: MessageRecord, currentUserId: string) {
  return message.sender_id === currentUserId
    ? message.receiver_id
    : message.sender_id;
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [listingMap, setListingMap] = useState<Record<string, ListingSummary>>(
    {}
  );

  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<ReplyStatus | null>(null);

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const conversations = useMemo(() => {
    if (!user) {
      return [];
    }

    const conversationMap: Record<string, Conversation> = {};

    messages.forEach((message) => {
      const conversationId = getConversationId(message, user.id);
      const otherUserId = getOtherUserId(message, user.id);
      const listingTitle = getListingTitle(message.listing_id, listingMap);
      const listingStatus = getListingStatus(message.listing_id, listingMap);
      const isUnreadForMe =
        message.receiver_id === user.id && message.read_at === null;

      if (!conversationMap[conversationId]) {
        conversationMap[conversationId] = {
          id: conversationId,
          listing_id: message.listing_id,
          other_user_id: otherUserId,
          listingTitle,
          listingStatus,
          lastMessage: message,
          messages: [],
          unreadCount: 0,
        };
      }

      conversationMap[conversationId].messages.push(message);

      if (isUnreadForMe) {
        conversationMap[conversationId].unreadCount += 1;
      }

      const currentLastMessageDate = new Date(
        conversationMap[conversationId].lastMessage.created_at
      ).getTime();
      const nextMessageDate = new Date(message.created_at).getTime();

      if (nextMessageDate > currentLastMessageDate) {
        conversationMap[conversationId].lastMessage = message;
      }
    });

    return Object.values(conversationMap)
      .map((conversation) => ({
        ...conversation,
        messages: conversation.messages.sort(
          (firstMessage, secondMessage) =>
            new Date(firstMessage.created_at).getTime() -
            new Date(secondMessage.created_at).getTime()
        ),
      }))
      .sort(
        (firstConversation, secondConversation) =>
          new Date(secondConversation.lastMessage.created_at).getTime() -
          new Date(firstConversation.lastMessage.created_at).getTime()
      );
  }, [messages, listingMap, user]);

  const totalUnreadCount = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedConversationId
    ) || conversations[0];

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

  async function markConversationAsRead(conversation: Conversation) {
    if (!user || isMarkingRead) {
      return;
    }

    const unreadMessageIds = conversation.messages
      .filter(
        (message) => message.receiver_id === user.id && message.read_at === null
      )
      .map((message) => message.id);

    if (unreadMessageIds.length === 0) {
      return;
    }

    setIsMarkingRead(true);

    const readAtValue = new Date().toISOString();

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        unreadMessageIds.includes(message.id)
          ? {
              ...message,
              read_at: readAtValue,
            }
          : message
      )
    );

    const { error } = await supabase
      .from("messages")
      .update({ read_at: readAtValue })
      .in("id", unreadMessageIds);

    if (error) {
      setErrorMessage(error.message);
      await loadMessages(user);
    }

    window.dispatchEvent(new Event("archery-swap-unread-changed"));
    setIsMarkingRead(false);
  }

  async function handleSendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !selectedConversation) {
      return;
    }

    const cleanedReplyText = replyText.trim();

    if (!cleanedReplyText) {
      setReplyStatus({
        type: "error",
        text: "Please type a reply before sending.",
      });
      return;
    }

    setIsSendingReply(true);
    setReplyStatus(null);

    const { error } = await supabase.from("messages").insert({
      listing_id: selectedConversation.listing_id,
      sender_id: user.id,
      receiver_id: selectedConversation.other_user_id,
      body: cleanedReplyText,
    });

    if (error) {
      setReplyStatus({
        type: "error",
        text: error.message,
      });
      setIsSendingReply(false);
      return;
    }

    setReplyText("");
    setReplyStatus({
      type: "success",
      text: "Reply sent.",
    });

    await loadMessages(user);
    setSelectedConversationId(selectedConversation.id);
    window.dispatchEvent(new Event("archery-swap-unread-changed"));
    setIsSendingReply(false);
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
        setSelectedConversationId("");
        setReplyText("");
        setReplyStatus(null);
        setErrorMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (selectedConversation) {
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation?.id]);

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header activePage="messages" />

      <section className="bg-stone-950 px-4 py-12 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Messages
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h2 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
                Buyer and seller conversations.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                Keep every conversation tied to the listing it belongs to, so
                buying and selling archery gear stays organized.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-stone-400">
                Message Tip
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-stone-200">
                Keep payment and shipping details clear before meeting or
                sending gear. Real checkout will be added later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {isLoadingSession ? (
          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="font-black">Checking sign-in status...</p>
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
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
            <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">
                    Inbox
                  </p>

                  <h3 className="mt-3 text-3xl font-black tracking-tight text-stone-950">
                    Messages for your account.
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    Signed in as{" "}
                    <span className="font-black text-stone-950">
                      {user.email}
                    </span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">
                      Conversations
                    </p>
                    <p className="mt-2 text-2xl font-black text-stone-950">
                      {conversations.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                      Unread
                    </p>
                    <p className="mt-2 text-2xl font-black text-emerald-800">
                      {totalUnreadCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5">
                <p className="text-sm font-bold text-stone-600">
                  {totalUnreadCount === 0
                    ? "You are caught up."
                    : `${totalUnreadCount} unread message${
                        totalUnreadCount === 1 ? "" : "s"
                      }`}
                </p>

                <button
                  type="button"
                  onClick={() => loadMessages(user)}
                  disabled={isLoadingMessages}
                  className="cursor-pointer rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-950 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMessages ? "Refreshing..." : "Refresh Messages"}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                {errorMessage}
              </div>
            ) : null}

            {isLoadingMessages ? (
              <div className="mt-6 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
                <p className="font-bold text-stone-700">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">
                  No Messages Yet
                </p>

                <h3 className="mt-4 text-3xl font-black tracking-tight">
                  Your inbox is empty.
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                  When you send a message to a seller, or someone messages you
                  about your listing, the conversation will appear here.
                </p>

                <Link
                  href="/browse"
                  className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500"
                >
                  Browse Gear
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid overflow-hidden rounded-3xl border border-stone-300 bg-white shadow-sm lg:grid-cols-[360px_1fr]">
                <aside className="border-b border-stone-300 bg-stone-50 lg:border-b-0 lg:border-r">
                  <div className="border-b border-stone-300 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black">Conversations</h3>
                        <p className="mt-1 text-sm font-bold text-stone-500">
                          Newest messages first
                        </p>
                      </div>

                      {totalUnreadCount > 0 ? (
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                          {totalUnreadCount} unread
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto p-3 lg:max-h-[720px]">
                    {conversations.map((conversation) => {
                      const isSelected =
                        selectedConversation?.id === conversation.id;
                      const lastMessageSentByMe =
                        conversation.lastMessage.sender_id === user.id;
                      const hasUnreadMessages = conversation.unreadCount > 0;

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => {
                            setSelectedConversationId(conversation.id);
                            setReplyText("");
                            setReplyStatus(null);
                          }}
                          className={`mb-3 w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 shadow-sm"
                              : hasUnreadMessages
                              ? "border-emerald-300 bg-white shadow-sm hover:bg-emerald-50"
                              : "border-stone-300 bg-white hover:bg-stone-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`truncate text-sm text-stone-950 ${
                                    hasUnreadMessages
                                      ? "font-black"
                                      : "font-bold"
                                  }`}
                                >
                                  {conversation.listingTitle}
                                </p>

                                {hasUnreadMessages ? (
                                  <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">
                                    {conversation.unreadCount}
                                  </span>
                                ) : null}
                              </div>

                              <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-stone-400">
                                {formatListingStatus(conversation.listingStatus)}
                              </p>

                              <p
                                className={`mt-2 line-clamp-2 text-xs leading-5 ${
                                  hasUnreadMessages
                                    ? "font-black text-stone-800"
                                    : "font-bold text-stone-500"
                                }`}
                              >
                                {lastMessageSentByMe ? "You: " : "Them: "}
                                {conversation.lastMessage.body}
                              </p>
                            </div>

                            <p className="shrink-0 text-xs font-black text-stone-400">
                              {formatShortDate(
                                conversation.lastMessage.created_at
                              )}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <section className="flex min-h-[620px] flex-col bg-white">
                  {selectedConversation ? (
                    <>
                      <div className="border-b border-stone-300 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                              Conversation
                            </p>

                            <h3 className="mt-2 text-2xl font-black">
                              {selectedConversation.listingTitle}
                            </h3>

                            <p className="mt-2 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-stone-600">
                              {formatListingStatus(
                                selectedConversation.listingStatus
                              )}
                            </p>
                          </div>

                          <Link
                            href={`/listing/${selectedConversation.listing_id}`}
                            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-black hover:bg-stone-100"
                          >
                            View Listing
                          </Link>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 overflow-y-auto bg-stone-100 p-4 sm:p-5">
                        {selectedConversation.messages.map((message) => {
                          const isSentByMe = message.sender_id === user.id;
                          const isUnreadForMe =
                            message.receiver_id === user.id &&
                            message.read_at === null;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isSentByMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[88%] rounded-2xl p-4 shadow-sm sm:max-w-[70%] ${
                                  isSentByMe
                                    ? "bg-emerald-600 text-white"
                                    : isUnreadForMe
                                    ? "border-2 border-emerald-300 bg-white text-stone-900"
                                    : "border border-stone-300 bg-white text-stone-900"
                                }`}
                              >
                                <p className="whitespace-pre-line text-sm font-bold leading-6">
                                  {message.body}
                                </p>

                                <p
                                  className={`mt-2 text-xs font-bold ${
                                    isSentByMe
                                      ? "text-emerald-100"
                                      : "text-stone-500"
                                  }`}
                                >
                                  {isSentByMe ? "You" : "Them"} •{" "}
                                  {formatMessageDate(message.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <form
                        onSubmit={handleSendReply}
                        className="border-t border-stone-300 bg-white p-4 sm:p-5"
                      >
                        <label
                          htmlFor="conversation-reply"
                          className="text-sm font-black text-stone-900"
                        >
                          Reply
                        </label>

                        <textarea
                          id="conversation-reply"
                          value={replyText}
                          onChange={(event) => {
                            setReplyText(event.target.value);
                            setReplyStatus(null);
                          }}
                          rows={3}
                          placeholder="Type your reply..."
                          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />

                        {replyStatus?.text ? (
                          <p
                            className={`mt-2 text-sm font-bold ${
                              replyStatus.type === "success"
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {replyStatus.text}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs font-bold leading-5 text-stone-500">
                            Keep personal, payment, and shipping details safe.
                          </p>

                          <button
                            type="submit"
                            disabled={isSendingReply}
                            className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSendingReply ? "Sending..." : "Send Reply"}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex flex-1 items-center justify-center p-8 text-center">
                      <div>
                        <p className="text-xl font-black">
                          Choose a conversation.
                        </p>
                        <p className="mt-2 text-sm font-bold text-stone-500">
                          Select a conversation to read and reply.
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}