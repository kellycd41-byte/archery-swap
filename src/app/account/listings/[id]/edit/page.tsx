"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

const categories = [
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

const handednessOptions = ["Right Hand", "Left Hand", "Ambidextrous", "N/A"];

type ListingForm = {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  location: string;
  brand: string;
  model: string;
  draw_weight: string;
  draw_length: string;
  handedness: string;
  included_accessories: string;
  shipping_available: boolean;
  offers_allowed: boolean;
};

const emptyForm: ListingForm = {
  title: "",
  description: "",
  price: "",
  category: "",
  condition: "",
  location: "",
  brand: "",
  model: "",
  draw_weight: "",
  draw_length: "",
  handedness: "",
  included_accessories: "",
  shipping_available: false,
  offers_allowed: true,
};

function formatStatus(status: string) {
  if (!status) {
    return "Unknown";
  }

  if (status === "active") {
    return "Approved";
  }

  if (status === "pending") {
    return "Pending Review";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();

  const listingId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [listingStatus, setListingStatus] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPage() {
      setIsLoadingSession(true);
      setIsLoadingListing(true);
      setErrorMessage("");

      const { data: sessionData } = await supabase.auth.getSession();
      const signedInUser = sessionData.session?.user ?? null;

      setUser(signedInUser);
      setIsLoadingSession(false);

      if (!signedInUser) {
        setIsLoadingListing(false);
        return;
      }

      if (!listingId) {
        setErrorMessage("Listing not found.");
        setIsLoadingListing(false);
        return;
      }

      const { data, error } = await supabase
        .from("listings")
        .select(
          "title,description,price,category,condition,location,brand,model,draw_weight,draw_length,handedness,included_accessories,shipping_available,offers_allowed,status"
        )
        .eq("id", listingId)
        .eq("user_id", signedInUser.id)
        .single();

      setIsLoadingListing(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!data) {
        setErrorMessage("Listing not found.");
        return;
      }

      setListingStatus(data.status || "");

      setForm({
        title: data.title || "",
        description: data.description || "",
        price:
          data.price === null || data.price === undefined
            ? ""
            : String(data.price),
        category: data.category || "",
        condition: data.condition || "",
        location: data.location || "",
        brand: data.brand || "",
        model: data.model || "",
        draw_weight: data.draw_weight || "",
        draw_length: data.draw_length || "",
        handedness: data.handedness || "",
        included_accessories: data.included_accessories || "",
        shipping_available: Boolean(data.shipping_available),
        offers_allowed: data.offers_allowed !== false,
      });
    }

    loadPage();
  }, [listingId]);

  function updateField<FieldName extends keyof ListingForm>(
    fieldName: FieldName,
    value: ListingForm[FieldName]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!user) {
      setErrorMessage("Please sign in again before saving this listing.");
      return;
    }

    const cleanedTitle = form.title.trim();
    const cleanedDescription = form.description.trim();
    const cleanedPrice = form.price.trim();

    if (!cleanedTitle) {
      setErrorMessage("Please enter a listing title.");
      return;
    }

    if (!cleanedDescription) {
      setErrorMessage("Please enter a listing description.");
      return;
    }

    if (!cleanedPrice) {
      setErrorMessage("Please enter a price.");
      return;
    }

    const priceNumber = Number(cleanedPrice);

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setErrorMessage("Please enter a valid price greater than 0.");
      return;
    }

    if (!form.category) {
      setErrorMessage("Please choose a category.");
      return;
    }

    if (!form.condition) {
      setErrorMessage("Please choose a condition.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("listings")
      .update({
        title: cleanedTitle,
        description: cleanedDescription,
        price: priceNumber,
        category: form.category,
        condition: form.condition,
        location: form.location.trim() || null,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        draw_weight: form.draw_weight.trim() || null,
        draw_length: form.draw_length.trim() || null,
        handedness: form.handedness || null,
        included_accessories: form.included_accessories.trim() || null,
        shipping_available: form.shipping_available,
        offers_allowed: form.offers_allowed,
      })
      .eq("id", listingId)
      .eq("user_id", user.id);

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Listing updated successfully.");
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <Header activePage="account" />

      <section className="bg-stone-950 px-4 py-12 text-white sm:px-6 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <Link
              href="/account"
              className="inline-block rounded-xl border border-stone-700 px-4 py-2 text-sm font-black text-stone-200 hover:bg-stone-900"
            >
              ← Back to Account
            </Link>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Edit Listing
            </p>

            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
              Update your listing details.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Keep your price, condition, specs, shipping choice, and offer
              settings accurate. Photo editing will be added later as a separate
              step.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              Current Status
            </p>

            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-2xl font-black">
              {formatStatus(listingStatus)}
            </p>

            <p className="mt-4 text-sm leading-6 text-stone-300">
              Editing details does not change approval status. Pending and
              denied listings still need admin review.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          {isLoadingSession || isLoadingListing ? (
            <div className="rounded-2xl border border-stone-300 bg-stone-50 p-5">
              <p className="font-black">Loading listing...</p>
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-black text-amber-900">
                Please sign in to edit your listing.
              </p>

              <Link
                href="/account"
                className="mt-4 inline-block rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white hover:bg-stone-800"
              >
                Go to Account
              </Link>
            </div>
          ) : errorMessage && !form.title ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="font-black text-red-800">{errorMessage}</p>

              <Link
                href="/account"
                className="mt-4 inline-block rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white hover:bg-stone-800"
              >
                Back to Account
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 border-b border-stone-200 pb-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
                  Listing Editor
                </p>

                <h3 className="mt-3 text-3xl font-black tracking-tight">
                  Make safe changes to your listing.
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                  This page updates listing details only. Existing photos stay
                  the same for now.
                </p>
              </div>

              {message ? (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                  {message}
                </div>
              ) : null}

              {errorMessage ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                  {errorMessage}
                </div>
              ) : null}

              <form onSubmit={handleSave} className="space-y-6">
                <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-black">Basic details</h4>
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        These are the main details buyers see first.
                      </p>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
                      Required
                    </span>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-black text-stone-700">
                      Title <span className="text-red-700">Required</span>
                    </label>

                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Price <span className="text-red-700">Required</span>
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={form.price}
                        onChange={(event) =>
                          updateField("price", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Category <span className="text-red-700">Required</span>
                      </label>

                      <select
                        value={form.category}
                        onChange={(event) =>
                          updateField("category", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      >
                        <option value="">Choose category</option>
                        {categories.map((categoryOption) => (
                          <option key={categoryOption} value={categoryOption}>
                            {categoryOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Condition{" "}
                        <span className="text-red-700">Required</span>
                      </label>

                      <select
                        value={form.condition}
                        onChange={(event) =>
                          updateField("condition", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      >
                        <option value="">Choose condition</option>
                        {conditions.map((conditionOption) => (
                          <option
                            key={conditionOption}
                            value={conditionOption}
                          >
                            {conditionOption}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-black text-stone-700">
                      Location
                    </label>

                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) =>
                        updateField("location", event.target.value)
                      }
                      placeholder="Example: Pennsylvania"
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 p-5">
                  <h4 className="text-xl font-black">Archery specs</h4>

                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Optional, but helpful for bows and technical gear.
                  </p>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Brand
                      </label>

                      <input
                        type="text"
                        value={form.brand}
                        onChange={(event) =>
                          updateField("brand", event.target.value)
                        }
                        placeholder="Example: Mathews"
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Model
                      </label>

                      <input
                        type="text"
                        value={form.model}
                        onChange={(event) =>
                          updateField("model", event.target.value)
                        }
                        placeholder="Example: V3X 33"
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Draw weight
                      </label>

                      <input
                        type="text"
                        value={form.draw_weight}
                        onChange={(event) =>
                          updateField("draw_weight", event.target.value)
                        }
                        placeholder="Example: 60-70 lbs"
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Draw length
                      </label>

                      <input
                        type="text"
                        value={form.draw_length}
                        onChange={(event) =>
                          updateField("draw_length", event.target.value)
                        }
                        placeholder="Example: 28.5 in"
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Handedness
                      </label>

                      <select
                        value={form.handedness}
                        onChange={(event) =>
                          updateField("handedness", event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      >
                        <option value="">Choose handedness</option>
                        {handednessOptions.map((handednessOption) => (
                          <option
                            key={handednessOption}
                            value={handednessOption}
                          >
                            {handednessOption}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-black text-stone-700">
                      Included accessories
                    </label>

                    <textarea
                      value={form.included_accessories}
                      onChange={(event) =>
                        updateField(
                          "included_accessories",
                          event.target.value
                        )
                      }
                      rows={4}
                      placeholder="Example: Sight, rest, quiver, stabilizer, case, arrows."
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 p-5">
                  <h4 className="text-xl font-black">
                    Shipping and offer settings
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    These settings affect what buyers can do on your listing.
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="flex items-start gap-3 rounded-2xl border border-stone-300 bg-stone-50 p-4">
                      <input
                        type="checkbox"
                        checked={form.shipping_available}
                        onChange={(event) =>
                          updateField(
                            "shipping_available",
                            event.target.checked
                          )
                        }
                        className="mt-1"
                      />

                      <span>
                        <span className="block font-black">
                          Shipping is available
                        </span>

                        <span className="mt-1 block text-sm leading-6 text-stone-600">
                          Check this if you are willing to ship this item to a
                          buyer.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-stone-300 bg-stone-50 p-4">
                      <input
                        type="checkbox"
                        checked={form.offers_allowed}
                        onChange={(event) =>
                          updateField("offers_allowed", event.target.checked)
                        }
                        className="mt-1"
                      />

                      <span>
                        <span className="block font-black">
                          Allow buyers to make offers
                        </span>

                        <span className="mt-1 block text-sm leading-6 text-stone-600">
                          Uncheck this if you only want buyers to use the future
                          Buy Now option.
                        </span>
                      </span>
                    </label>
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-black">Description</h4>

                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        Be honest about condition, wear, age, included items,
                        and anything buyers should know.
                      </p>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
                      Required
                    </span>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-black text-stone-700">
                      Description{" "}
                      <span className="text-red-700">Required</span>
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      rows={6}
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                </section>

                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                  <h4 className="font-black text-amber-950">
                    Photo editing is coming later
                  </h4>

                  <p className="mt-2 text-sm font-bold leading-6 text-amber-900">
                    This page currently updates listing details only. Your
                    existing listing photos will stay unchanged.
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => router.push("/account")}
                    className="cursor-pointer rounded-2xl border border-stone-300 bg-white px-6 py-4 text-sm font-black hover:bg-stone-100"
                  >
                    Back to Account
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="cursor-pointer rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}