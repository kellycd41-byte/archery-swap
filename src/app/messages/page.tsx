import Link from "next/link";

const conversations = [
  {
    name: "BowHunter41",
    item: "Mathews V3X Compound Bow",
    lastMessage: "Is the bow still available?",
    time: "10:42 AM",
    active: true,
  },
  {
    name: "CrossbowCrew",
    item: "Ravin Crossbow Package",
    lastMessage: "Would you consider $975?",
    time: "Yesterday",
    active: false,
  },
  {
    name: "TargetTime",
    item: "Easton Axis Arrows - Dozen",
    lastMessage: "Can you ship to Pennsylvania?",
    time: "Monday",
    active: false,
  },
];

const messages = [
  {
    sender: "buyer",
    text: "Hey, is the Mathews V3X still available?",
  },
  {
    sender: "seller",
    text: "Yes, it is still available.",
  },
  {
    sender: "buyer",
    text: "Great. Any damage or issues I should know about?",
  },
  {
    sender: "seller",
    text: "No damage. It has normal wear from hunting season, but everything works well.",
  },
];

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <header className="border-b border-stone-300 bg-stone-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="block">
            <h1 className="text-2xl font-black tracking-tight">
              Archery Swap
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
              Buy • Sell • Archery Gear
            </p>
          </Link>

          <nav className="hidden gap-6 text-sm font-bold md:flex">
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

          <Link
            href="/sell"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
          >
            Sell Your Gear
          </Link>
        </div>
      </header>

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Messages
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            Keep buyer and seller conversations in one place.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            This is the first version of messaging. Later, we’ll connect this to
            real user accounts, listings, notifications, and database messages.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-3xl border border-stone-300 bg-white p-4 shadow-sm">
          <h3 className="px-2 pb-4 text-2xl font-black">Inbox</h3>

          <div className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.name}
                className={`w-full rounded-2xl border p-4 text-left ${
                  conversation.active
                    ? "border-emerald-700 bg-emerald-50"
                    : "border-stone-300 bg-stone-50 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{conversation.name}</p>
                  <p className="text-xs font-bold text-stone-500">
                    {conversation.time}
                  </p>
                </div>

                <p className="mt-1 text-sm font-bold text-emerald-800">
                  {conversation.item}
                </p>

                <p className="mt-2 line-clamp-1 text-sm text-stone-600">
                  {conversation.lastMessage}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl border border-stone-300 bg-white shadow-sm">
          <div className="border-b border-stone-300 p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
              Mathews V3X Compound Bow
            </p>

            <h3 className="mt-2 text-2xl font-black">Conversation with BowHunter41</h3>

            <Link
              href="/listing/1"
              className="mt-3 inline-block text-sm font-black text-emerald-800 hover:text-emerald-600"
            >
              View listing →
            </Link>
          </div>

          <div className="space-y-4 p-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "buyer" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xl rounded-2xl px-5 py-3 ${
                    message.sender === "buyer"
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-950"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-300 p-6">
            <label className="text-sm font-black text-stone-700">
              New message
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
              />

              <button className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500">
                Send
              </button>
            </div>

            <p className="mt-3 text-sm text-stone-500">
              Sending messages will be connected later.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}