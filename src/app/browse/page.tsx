import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

const handednessOptions = ["Right Hand", "Left Hand", "Ambidextrous"];

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string | null;
  image_url: string | null;
  image_urls: string[] | null;
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
    drawWeight?: string;
    drawLength?: string;
    handedness?: string;
  }>;
};

type BrowseHrefOptions = {
  category: string;
  selectedConditions: string[];
  search: string;
  sort: string;
  drawWeight: string;
  drawLength: string;
  handedness: string;
};

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

function getSelectedHandedness(handednessParam: string | undefined) {
  if (!handednessParam || !handednessOptions.includes(handednessParam)) {
    return "";
  }

  return handednessParam;
}

function buildBrowseHref(options: BrowseHrefOptions) {
  const params = new URLSearchParams();

  if (options.category !== "All") {
    params.set("category", options.category);
  }

  if (options.selectedConditions.length > 0) {
    params.set("conditions", options.selectedConditions.join(","));
  }

  if (options.search.trim()) {
    params.set("search", options.search.trim());
  }

  if (options.sort !== "newest") {
    params.set("sort", options.sort);
  }

  if (options.category === "Bows") {
    if (options.drawWeight.trim()) {
      params.set("drawWeight", options.drawWeight.trim());
    }

    if (options.drawLength.trim()) {
      params.set("drawLength", options.drawLength.trim());
    }

    if (options.handedness) {
      params.set("handedness", options.handedness);
    }
  }

  const queryString = params.toString();

  return queryString ? `/browse?${queryString}` : "/browse";
}

function toggleCondition(
  condition: string,
  selectedConditions: string[],
  selectedCategory: string,
  searchTerm: string,
  selectedSort: string,
  selectedDrawWeight: string,
  selectedDrawLength: string,
  selectedHandedness: string
) {
  const conditionIsSelected = selectedConditions.includes(condition);

  const nextConditions = conditionIsSelected
    ? selectedConditions.filter(
        (selectedCondition) => selectedCondition !== condition
      )
    : [...selectedConditions, condition];

  return buildBrowseHref({
    category: selectedCategory,
    selectedConditions: nextConditions,
    search: searchTerm,
    sort: selectedSort,
    drawWeight: selectedDrawWeight,
    drawLength: selectedDrawLength,
    handedness: selectedHandedness,
  });
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

function getListingPhotoUrl(item: Listing) {
  if (item.image_urls && item.image_urls.length > 0 && item.image_urls[0]) {
    return item.image_urls[0];
  }

  return item.image_url;
}

function BrowsePhotoPlaceholder() {
  return (
    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 px-5 text-center">
      <div className="absolute left-5 top-5 h-14 w-14 rounded-full border border-emerald-300/20" />
      <div className="absolute bottom-5 right-5 h-16 w-16 rounded-full border border-white/10" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />

      <div className="relative">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/40 bg-white/10 text-xl">
          🎯
        </div>
        <p className="mt-3 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
          No Photo Yet
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
  const selectedDrawWeight =
    selectedCategory === "Bows" ? params.drawWeight?.trim() || "" : "";
  const selectedDrawLength =
    selectedCategory === "Bows" ? params.drawLength?.trim() || "" : "";
  const selectedHandedness =
    selectedCategory === "Bows"
      ? getSelectedHandedness(params.handedness)
      : "";

  const bowFiltersAreActive =
    selectedDrawWeight || selectedDrawLength || selectedHandedness;

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

  if (selectedCategory === "Bows" && selectedDrawWeight) {
    query = query.ilike("draw_weight", `%${selectedDrawWeight}%`);
  }

  if (selectedCategory === "Bows" && selectedDrawLength) {
    query = query.ilike("draw_length", `%${selectedDrawLength}%`);
  }

  if (selectedCategory === "Bows" && selectedHandedness) {
    query = query.eq("handedness", selectedHandedness);
  }

  if (selectedSort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (selectedSort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: listings, error } = await query;
  const listingCount = listings?.length || 0;

  const conditionLabel =
    selectedConditions.length > 0 ? selectedConditions.join(", ") : "All";

  const selectedSortLabel =
    sortOptions.find((option) => option.value === selectedSort)?.label ||
    "Sort: Newest";

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header activePage="browse" />

      <section className="bg-stone-950 px-4 py-12 text-white sm:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Browse Gear
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <h2 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
                Shop approved archery gear.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                Quickly compare bows, crossbows, sights, releases, arrows,
                cases, targets, and accessories from other sellers.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-stone-400">
                Marketplace
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {listingCount}
              </p>
              <p className="mt-1 text-sm font-bold text-stone-300">
                active listing{listingCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-stone-300 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:self-start">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Filters</h3>

              {selectedCategory !== "All" ||
              selectedConditions.length > 0 ||
              searchTerm ||
              selectedSort !== "newest" ||
              bowFiltersAreActive ? (
                <Link
                  href="/browse"
                  scroll={false}
                  className="text-xs font-black text-emerald-800 hover:text-emerald-600"
                >
                  Clear All
                </Link>
              ) : null}
            </div>

            <form action="/browse" className="mt-4">
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

              {selectedCategory === "Bows" && selectedDrawWeight ? (
                <input
                  type="hidden"
                  name="drawWeight"
                  value={selectedDrawWeight}
                />
              ) : null}

              {selectedCategory === "Bows" && selectedDrawLength ? (
                <input
                  type="hidden"
                  name="drawLength"
                  value={selectedDrawLength}
                />
              ) : null}

              {selectedCategory === "Bows" && selectedHandedness ? (
                <input
                  type="hidden"
                  name="handedness"
                  value={selectedHandedness}
                />
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
                  href={buildBrowseHref({
                    category: selectedCategory,
                    selectedConditions,
                    search: "",
                    sort: selectedSort,
                    drawWeight: selectedDrawWeight,
                    drawLength: selectedDrawLength,
                    handedness: selectedHandedness,
                  })}
                  scroll={false}
                  className="mt-3 block text-center text-sm font-black text-emerald-800 hover:text-emerald-600"
                >
                  Clear Search
                </Link>
              ) : null}
            </form>

            <details className="mt-5 rounded-2xl border border-stone-300 bg-stone-50 p-4 lg:hidden">
              <summary className="cursor-pointer list-none text-sm font-black text-stone-800">
                Category: {selectedCategory}
              </summary>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const href = buildBrowseHref({
                    category,
                    selectedConditions,
                    search: searchTerm,
                    sort: selectedSort,
                    drawWeight: selectedDrawWeight,
                    drawLength: selectedDrawLength,
                    handedness: selectedHandedness,
                  });
                  const isSelected = selectedCategory === category;

                  return (
                    <Link
                      key={category}
                      href={href}
                      scroll={false}
                      className={`block w-full rounded-xl border px-3 py-2 text-center text-sm font-bold ${
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

            <div className="mt-5 hidden lg:block">
              <p className="text-sm font-black text-stone-700">Category</p>

              <div className="mt-3 grid gap-2">
                {categories.map((category) => {
                  const href = buildBrowseHref({
                    category,
                    selectedConditions,
                    search: searchTerm,
                    sort: selectedSort,
                    drawWeight: selectedDrawWeight,
                    drawLength: selectedDrawLength,
                    handedness: selectedHandedness,
                  });
                  const isSelected = selectedCategory === category;

                  return (
                    <Link
                      key={category}
                      href={href}
                      scroll={false}
                      className={`block w-full rounded-xl border px-3 py-2 text-left text-sm font-bold ${
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

              <div className="mt-3 grid grid-cols-2 gap-2">
                {conditions.map((condition) => {
                  const isSelected = selectedConditions.includes(condition);
                  const href = toggleCondition(
                    condition,
                    selectedConditions,
                    selectedCategory,
                    searchTerm,
                    selectedSort,
                    selectedDrawWeight,
                    selectedDrawLength,
                    selectedHandedness
                  );

                  return (
                    <Link
                      key={condition}
                      href={href}
                      scroll={false}
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-bold ${
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
              </div>
            </details>

            <div className="mt-5 hidden lg:block">
              <p className="text-sm font-black text-stone-700">Condition</p>

              <div className="mt-3 grid gap-2">
                {conditions.map((condition) => {
                  const isSelected = selectedConditions.includes(condition);
                  const href = toggleCondition(
                    condition,
                    selectedConditions,
                    selectedCategory,
                    searchTerm,
                    selectedSort,
                    selectedDrawWeight,
                    selectedDrawLength,
                    selectedHandedness
                  );

                  return (
                    <Link
                      key={condition}
                      href={href}
                      scroll={false}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm font-bold ${
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
                  href={buildBrowseHref({
                    category: selectedCategory,
                    selectedConditions: [],
                    search: searchTerm,
                    sort: selectedSort,
                    drawWeight: selectedDrawWeight,
                    drawLength: selectedDrawLength,
                    handedness: selectedHandedness,
                  })}
                  scroll={false}
                  className="mt-3 block text-sm font-black text-emerald-800 hover:text-emerald-600"
                >
                  Clear Conditions
                </Link>
              ) : null}
            </div>

            {selectedCategory === "Bows" ? (
              <form
                action="/browse"
                className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <input type="hidden" name="category" value="Bows" />

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

                {selectedSort !== "newest" ? (
                  <input type="hidden" name="sort" value={selectedSort} />
                ) : null}

                <p className="text-sm font-black text-emerald-950">
                  Bow Details
                </p>

                <label className="mt-4 block text-xs font-black uppercase tracking-[0.16em] text-emerald-900">
                  Draw Weight
                </label>
                <input
                  type="text"
                  name="drawWeight"
                  defaultValue={selectedDrawWeight}
                  placeholder="Example: 60"
                  className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-[0.16em] text-emerald-900">
                  Draw Length
                </label>
                <input
                  type="text"
                  name="drawLength"
                  defaultValue={selectedDrawLength}
                  placeholder="Example: 29"
                  className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-700"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-[0.16em] text-emerald-900">
                  Handedness
                </label>
                <select
                  name="handedness"
                  defaultValue={selectedHandedness}
                  className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-700"
                >
                  <option value="">Any Hand</option>
                  {handednessOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600"
                >
                  Apply Bow Filters
                </button>

                {bowFiltersAreActive ? (
                  <Link
                    href={buildBrowseHref({
                      category: selectedCategory,
                      selectedConditions,
                      search: searchTerm,
                      sort: selectedSort,
                      drawWeight: "",
                      drawLength: "",
                      handedness: "",
                    })}
                    scroll={false}
                    className="mt-3 block text-center text-sm font-black text-emerald-900 hover:text-emerald-700"
                  >
                    Clear Bow Filters
                  </Link>
                ) : null}
              </form>
            ) : null}
          </aside>

          <div>
            <div className="mb-5 rounded-2xl border border-stone-300 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div>
                  <h3 className="text-2xl font-black">Available Gear</h3>

                  <p className="mt-1 text-sm font-bold text-stone-600">
                    {listingCount === 1
                      ? "Showing 1 approved active listing."
                      : `Showing ${listingCount} approved active listings.`}
                  </p>

                  {selectedCategory !== "All" ||
                  selectedConditions.length > 0 ||
                  searchTerm ||
                  selectedSort !== "newest" ||
                  bowFiltersAreActive ? (
                    <p className="mt-2 text-sm font-bold leading-6 text-stone-500">
                      Category: {selectedCategory} • Conditions:{" "}
                      {conditionLabel} • {selectedSortLabel}
                      {searchTerm ? ` • Search: “${searchTerm}”` : ""}
                      {selectedDrawWeight
                        ? ` • Draw Weight: ${selectedDrawWeight}`
                        : ""}
                      {selectedDrawLength
                        ? ` • Draw Length: ${selectedDrawLength}`
                        : ""}
                      {selectedHandedness
                        ? ` • Handedness: ${selectedHandedness}`
                        : ""}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm font-bold text-stone-500">
                      Listings are reviewed before they appear here.
                    </p>
                  )}
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

                  {selectedCategory === "Bows" && selectedDrawWeight ? (
                    <input
                      type="hidden"
                      name="drawWeight"
                      value={selectedDrawWeight}
                    />
                  ) : null}

                  {selectedCategory === "Bows" && selectedDrawLength ? (
                    <input
                      type="hidden"
                      name="drawLength"
                      value={selectedDrawLength}
                    />
                  ) : null}

                  {selectedCategory === "Bows" && selectedHandedness ? (
                    <input
                      type="hidden"
                      name="handedness"
                      value={selectedHandedness}
                    />
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
                  Try a different search, category, condition, bow detail, or
                  sort option, or be the first person to list gear that matches
                  this filter.
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
              <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(listings as Listing[]).map((item) => {
                  const brandModelText = getBrandModelText(item);
                  const compactSpecs = getCompactSpecs(item);
                  const photoUrl = getListingPhotoUrl(item);

                  return (
                    <article
                      key={item.id}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {photoUrl ? (
                        <Link
                          href={`/listing/${item.id}`}
                          className="flex h-40 items-center justify-center bg-stone-200 p-3"
                        >
                          <img
                            src={photoUrl}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain transition group-hover:scale-[1.02]"
                          />
                        </Link>
                      ) : (
                        <Link href={`/listing/${item.id}`}>
                          <BrowsePhotoPlaceholder />
                        </Link>
                      )}

                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">
                            {item.category}
                          </p>

                          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-black text-stone-700">
                            {item.condition}
                          </span>
                        </div>

                        <Link href={`/listing/${item.id}`}>
                          <h4 className="mt-2 line-clamp-2 text-lg font-black leading-6 hover:text-emerald-800">
                            {item.title}
                          </h4>
                        </Link>

                        {brandModelText ? (
                          <p className="mt-1 line-clamp-1 text-sm font-black text-stone-700">
                            {brandModelText}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {compactSpecs.slice(0, 3).map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full border border-stone-300 bg-stone-50 px-2.5 py-1 text-[11px] font-bold text-stone-700"
                            >
                              {spec}
                            </span>
                          ))}


                        </div>

                        <p className="mt-3 line-clamp-1 text-sm font-bold text-stone-500">
                          {item.location || "Location not listed"}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
                          {item.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                          <p className="text-2xl font-black">
                            ${Number(item.price).toLocaleString()}
                          </p>

                          <Link
                            href={`/listing/${item.id}`}
                            className="shrink-0 rounded-xl bg-stone-950 px-3.5 py-2 text-center text-sm font-black text-white hover:bg-stone-800"
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
      <Footer />
    </main>
  );
}