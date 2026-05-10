import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categories = [
  "All",
  "Bows",
  "Crossbows",
  "Sights",
  "Releases",
  "Arrows",
  "Cases",
  "Targets",
  "Accessories",
];

const conditions = ["New", "Excellent", "Very Good", "Good", "Fair"];

const sortOptions = [
  { label: "Sort: Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string | null;
  image_url: string | null;
  seller_name: string | null;
  seller_email: string | null;
  status: string;
  created_at: string;
  brand: string | null;
  model: string | null;
  draw_weight: string | null;
  draw_length: string | null;
  handedness: string | null;
  included_accessories: string | null;
  shipping_available: boolean;
};

type BrowsePageProps = {
  searchParams: Promise<{
    category?: string;
    conditions?: string;
    search?: string;
    sort?: string;
  }>;
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
            <Link href="/browse" className="text-emerald-300">
              Browse Gear
            </Link>
            <Link href="/sell" className="hover:text-emerald-300">
              Sell Gear
            </Link>
            <Link href="/messages" className="hover:text-emerald-300">
              Messages
            </Link>
            <Link href="/account" className="hover:text-emerald-300">
              Account
            </Link>
            <Link href="/admin" className="hover:text-emerald-300">
              Admin
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
                className="block border-b border-stone-800 bg-stone-800 px-4 py-3 text-sm font-bold text-emerald-300"
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
                className="block border-b border-stone-800 px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Account
              </Link>
              <Link
                href="/admin"
                className="block px-4 py-3 text-sm font-bold hover:bg-stone-800"
              >
                Admin
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

function getSelectedConditions(conditionsParam: string | undefined) {
  if (!conditionsParam) {
    return [];
  }

  return conditionsParam
    .split(",")
    .map((condition) => condition.trim())
    .filter((condition) => conditions.includes(condition));
}

function getSelectedSort(sortParam: string | undefined) {
  const validSortValues = sortOptions.map((option) => option.value);

  if (!sortParam || !validSortValues.includes(sortParam)) {
    return "newest";
  }

  return sortParam;
}

function buildBrowseHref(
  category: string,
  selectedConditions: string[],
  search: string,
  sort: string
) {
  const params = new URLSearchParams();

  if (category !== "All") {
    params.set("category", category);
  }

  if (selectedConditions.length > 0) {
    params.set("conditions", selectedConditions.join(","));
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (sort !== "newest") {
    params.set("sort", sort);
  }

  const queryString = params.toString();

  return queryString ? `/browse?${queryString}` : "/browse";
}

function toggleCondition(
  condition: string,
  selectedConditions: string[],
  selectedCategory: string,
  searchTerm: string,
  selectedSort: string
) {
  const conditionIsSelected = selectedConditions.includes(condition);

  const nextConditions = conditionIsSelected
    ? selectedConditions.filter(
        (selectedCondition) => selectedCondition !== condition
      )
    : [...selectedConditions, condition];

  return buildBrowseHref(
    selectedCategory,
    nextConditions,
    searchTerm,
    selectedSort
  );
}

function getBrandModelText(item: Listing) {
  const brand = item.brand?.trim();
  const model = item.model?.trim();

  if (brand && model) {
    return `${brand} ${model}`;
  }

  if (brand) {
    return brand;
  }

  if (model) {
    return model;
  }

  return null;
}

function getCompactSpecs(item: Listing) {
  const specs = [];

  if (item.draw_weight?.trim()) {
    specs.push(`${item.draw_weight.trim()} draw`);
  }

  if (item.draw_length?.trim()) {
    specs.push(`${item.draw_length.trim()} length`);
  }

  if (item.handedness?.trim()) {
    specs.push(item.handedness.trim());
  }

  return specs;
}

function BrowsePhotoPlaceholder() {
  return (
    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 px-5 text-center">
      <div className="absolute left-5 top-5 h-16 w-16 rounded-full border border-emerald-300/20" />
      <div className="absolute bottom-5 right-5 h-20 w-20 rounded-full border border-white/10" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />

      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/40 bg-white/10 text-2xl">
          🎯
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
          No Photo Yet
        </p>
        <p className="mt-1 text-xs font-bold text-white/60">
          Ask seller for pictures
        </p>
      </div>
    </div>
  );
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const selectedCategory = params.category || "All";
  const selectedConditions = getSelectedConditions(params.conditions);
  const selectedSort = getSelectedSort(params.sort);
  const searchTerm = params.search?.trim() || "";

  let query = supabase.from("listings").select("*").eq("status", "active");

  if (selectedCategory !== "All") {
    query = query.eq("category", selectedCategory);
  }

  if (selectedConditions.length > 0) {
    query = query.in("condition", selectedConditions);
  }

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,condition.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,draw_weight.ilike.%${searchTerm}%,draw_length.ilike.%${searchTerm}%,handedness.ilike.%${searchTerm}%`
    );
  }

  if (selectedSort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (selectedSort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: listings, error } = await query;

  const conditionLabel =
    selectedConditions.length > 0 ? selectedConditions.join(", ") : "All";

  const selectedSortLabel =
    sortOptions.find((option) => option.value === selectedSort)?.label ||
    "Sort: Newest";

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header />

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Browse Gear
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            Find approved archery gear from other sellers.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            Search by gear type, condition, brand, model, location, draw
            weight, draw length, and handedness. Only approved active listings
            appear here.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black">Filters</h3>

            <form action="/browse" className="mt-5">
              {selectedCategory !== "All" ? (
                <input type="hidden" name="category" value={selectedCategory} />
              ) : null}

              {selectedConditions.length > 0 ? (
                <input
                  type="hidden"
                  name="conditions"
                  value={selectedConditions.join(",")}
                />
              ) : null}

              {selectedSort !== "newest" ? (
                <input type="hidden" name="sort" value={selectedSort} />
              ) : null}

              <label className="text-sm font-black text-stone-700">
                Search
              </label>

              <input
                type="text"
                name="search"
                defaultValue={searchTerm}
                placeholder="Search gear..."
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-700"
              />

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500"
              >
                Search
              </button>

              {searchTerm ? (
                <Link
                  href={buildBrowseHref(
                    selectedCategory,
                    selectedConditions,
                    "",
                    selectedSort
                  )}
                  scroll={false}
                  className="mt-3 block text-center text-sm font-black text-emerald-800 hover:text-emerald-600"
                >
                  Clear Search
                </Link>
              ) : null}
            </form>

            <details className="mt-6 rounded-2xl border border-stone-300 bg-stone-50 p-4 lg:hidden">
              <summary className="cursor-pointer list-none text-sm font-black text-stone-800">
                Category: {selectedCategory}
              </summary>

              <div className="mt-3 space-y-2">
                {categories.map((category) => {
                  const href = buildBrowseHref(
                    category,
                    selectedConditions,
                    searchTerm,
                    selectedSort
                  );
                  const isSelected = selectedCategory === category;

                  return (
                    <Link
                      key={category}
                      href={href}
                      scroll={false}
                      className={`block w-full rounded-xl border px-4 py-2 text-left text-sm font-bold ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {category}
                    </Link>
                  );
                })}
              </div>
            </details>

            <div className="mt-6 hidden lg:block">
              <p className="text-sm font-black text-stone-700">Category</p>

              <div className="mt-3 space-y-2">
                {categories.map((category) => {
                  const href = buildBrowseHref(
                    category,
                    selectedConditions,
                    searchTerm,
                    selectedSort
                  );
                  const isSelected = selectedCategory === category;

                  return (
                    <Link
                      key={category}
                      href={href}
                      scroll={false}
                      className={`block w-full rounded-xl border px-4 py-2 text-left text-sm font-bold ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-stone-300 text-stone-700 hover:border-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {category}
                    </Link>
                  );
                })}
              </div>
            </div>

            <details className="mt-4 rounded-2xl border border-stone-300 bg-stone-50 p-4 lg:hidden">
              <summary className="cursor-pointer list-none text-sm font-black text-stone-800">
                Conditions: {conditionLabel}
              </summary>

              <div className="mt-3 space-y-2">
                {conditions.map((condition) => {
                  const isSelected = selectedConditions.includes(condition);
                  const href = toggleCondition(
                    condition,
                    selectedConditions,
                    selectedCategory,
                    searchTerm,
                    selectedSort
                  );

                  return (
                    <Link
                      key={condition}
                      href={href}
                      scroll={false}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2 text-left text-sm font-bold ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-stone-400 bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                      {condition}
                    </Link>
                  );
                })}

                {selectedConditions.length > 0 ? (
                  <Link
                    href={buildBrowseHref(
                      selectedCategory,
                      [],
                      searchTerm,
                      selectedSort
                    )}
                    scroll={false}
                    className="block text-sm font-black text-emerald-800 hover:text-emerald-600"
                  >
                    Clear Conditions
                  </Link>
                ) : null}
              </div>
            </details>

            <div className="mt-6 hidden lg:block">
              <p className="text-sm font-black text-stone-700">Condition</p>

              <div className="mt-3 space-y-2">
                {conditions.map((condition) => {
                  const isSelected = selectedConditions.includes(condition);
                  const href = toggleCondition(
                    condition,
                    selectedConditions,
                    selectedCategory,
                    searchTerm,
                    selectedSort
                  );

                  return (
                    <Link
                      key={condition}
                      href={href}
                      scroll={false}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2 text-left text-sm font-bold ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                          : "border-stone-300 text-stone-700 hover:border-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-stone-400 bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                      {condition}
                    </Link>
                  );
                })}
              </div>

              {selectedConditions.length > 0 ? (
                <Link
                  href={buildBrowseHref(
                    selectedCategory,
                    [],
                    searchTerm,
                    selectedSort
                  )}
                  scroll={false}
                  className="mt-3 block text-sm font-black text-emerald-800 hover:text-emerald-600"
                >
                  Clear Conditions
                </Link>
              ) : null}
            </div>

            {selectedCategory !== "All" ||
            selectedConditions.length > 0 ||
            searchTerm ||
            selectedSort !== "newest" ? (
              <Link
                href="/browse"
                scroll={false}
                className="mt-6 block rounded-xl border border-stone-400 px-4 py-3 text-center text-sm font-black text-stone-950 hover:bg-stone-100"
              >
                Clear All Filters
              </Link>
            ) : null}
          </aside>

          <div>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-2xl font-black">Available Gear</h3>
                <p className="text-stone-600">
                  {selectedCategory === "All" &&
                  selectedConditions.length === 0 &&
                  !searchTerm &&
                  selectedSort === "newest"
                    ? "Showing all approved active listings."
                    : "Showing filtered approved listings."}
                </p>

                {selectedCategory !== "All" ||
                selectedConditions.length > 0 ||
                searchTerm ||
                selectedSort !== "newest" ? (
                  <p className="mt-1 text-sm font-bold text-stone-500">
                    Category: {selectedCategory} • Conditions: {conditionLabel}{" "}
                    • {selectedSortLabel}
                    {searchTerm ? ` • Search: “${searchTerm}”` : ""}
                  </p>
                ) : null}
              </div>

              <form action="/browse" className="flex flex-col gap-2 sm:flex-row">
                {selectedCategory !== "All" ? (
                  <input
                    type="hidden"
                    name="category"
                    value={selectedCategory}
                  />
                ) : null}

                {selectedConditions.length > 0 ? (
                  <input
                    type="hidden"
                    name="conditions"
                    value={selectedConditions.join(",")}
                  />
                ) : null}

                {searchTerm ? (
                  <input type="hidden" name="search" value={searchTerm} />
                ) : null}

                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-950"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-stone-950 px-4 py-3 text-sm font-black text-white hover:bg-stone-800"
                >
                  Apply
                </button>
              </form>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm font-bold text-red-800">
                Could not load listings: {error.message}
              </div>
            ) : null}

            {!error && (!listings || listings.length === 0) ? (
              <div className="rounded-2xl border border-stone-300 bg-white p-8 text-center shadow-sm">
                <h4 className="text-2xl font-black">No listings found</h4>
                <p className="mt-2 text-stone-600">
                  Try a different search, category, condition, or sort option,
                  or be the first person to list gear that matches this filter.
                </p>

                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/browse"
                    scroll={false}
                    className="inline-block rounded-xl border border-stone-400 px-5 py-3 font-black text-stone-950 hover:bg-stone-100"
                  >
                    Clear Filters
                  </Link>

                  <Link
                    href="/sell"
                    className="inline-block rounded-xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-500"
                  >
                    Sell Your Gear
                  </Link>
                </div>
              </div>
            ) : null}

            {!error && listings && listings.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {(listings as Listing[]).map((item) => {
                  const brandModelText = getBrandModelText(item);
                  const compactSpecs = getCompactSpecs(item);

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <BrowsePhotoPlaceholder />
                      )}

                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                            {item.category}
                          </p>

                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700">
                            {item.condition}
                          </span>
                        </div>

                        <h4 className="mt-2 text-xl font-black">
                          {item.title}
                        </h4>

                        {brandModelText ? (
                          <p className="mt-1 text-sm font-black text-stone-700">
                            {brandModelText}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {compactSpecs.map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-700"
                            >
                              {spec}
                            </span>
                          ))}

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${
                              item.shipping_available
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                : "border-stone-300 bg-stone-50 text-stone-700"
                            }`}
                          >
                            {item.shipping_available
                              ? "Shipping Available"
                              : "Local Only"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-bold text-stone-500">
                          {item.location || "Location not listed"}
                        </p>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                          {item.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between">
                          <p className="text-2xl font-black">
                            ${Number(item.price).toLocaleString()}
                          </p>

                          <Link
                            href={`/listing/${item.id}`}
                            className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-black text-white hover:bg-stone-800"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
