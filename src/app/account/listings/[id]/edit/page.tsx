"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

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

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
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
            Edit the basic details for your gear. Photo editing will be added
            later as a separate step.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
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
              <div className="mb-6 rounded-2xl border border-stone-300 bg-stone-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  Current Status
                </p>
                <p className="mt-2 text-lg font-black">
                  {listingStatus || "Unknown"}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Editing these details does not change approval status. Pending
                  and denied listings still need admin review.
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

              <form onSubmit={handleSave} className="grid gap-6">
                <label className="grid gap-2">
                  <span className="text-sm font-black">Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    rows={6}
                    className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                <div className="grid gap-5 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-black">Price</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.price}
                      onChange={(event) =>
                        updateField("price", event.target.value)
                      }
                      className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-black">Category</span>
                    <select
                      value={form.category}
                      onChange={(event) =>
                        updateField("category", event.target.value)
                      }
                      className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    >
                      <option value="">Choose category</option>
                      <option value="Compound Bows">Compound Bows</option>
                      <option value="Recurve Bows">Recurve Bows</option>
                      <option value="Traditional Bows">Traditional Bows</option>
                      <option value="Crossbows">Crossbows</option>
                      <option value="Arrows">Arrows</option>
                      <option value="Releases">Releases</option>
                      <option value="Sights">Sights</option>
                      <option value="Rests">Rests</option>
                      <option value="Stabilizers">Stabilizers</option>
                      <option value="Cases">Cases</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-black">Condition</span>
                    <select
                      value={form.condition}
                      onChange={(event) =>
                        updateField("condition", event.target.value)
                      }
                      className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    >
                      <option value="">Choose condition</option>
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Work">Needs Work</option>
                    </select>
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-black">Location</span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                  />
                </label>

                <div className="rounded-3xl border border-stone-300 bg-stone-50 p-5">
                  <h3 className="text-xl font-black">Archery Specs</h3>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-black">Brand</span>
                      <input
                        type="text"
                        value={form.brand}
                        onChange={(event) =>
                          updateField("brand", event.target.value)
                        }
                        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black">Model</span>
                      <input
                        type="text"
                        value={form.model}
                        onChange={(event) =>
                          updateField("model", event.target.value)
                        }
                        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black">Draw Weight</span>
                      <input
                        type="text"
                        value={form.draw_weight}
                        onChange={(event) =>
                          updateField("draw_weight", event.target.value)
                        }
                        placeholder="Example: 60 lb"
                        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black">Draw Length</span>
                      <input
                        type="text"
                        value={form.draw_length}
                        onChange={(event) =>
                          updateField("draw_length", event.target.value)
                        }
                        placeholder='Example: 28"'
                        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black">Handedness</span>
                      <select
                        value={form.handedness}
                        onChange={(event) =>
                          updateField("handedness", event.target.value)
                        }
                        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                      >
                        <option value="">Choose handedness</option>
                        <option value="Right Hand">Right Hand</option>
                        <option value="Left Hand">Left Hand</option>
                        <option value="Ambidextrous">Ambidextrous</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3">
                      <input
                        type="checkbox"
                        checked={form.shipping_available}
                        onChange={(event) =>
                          updateField(
                            "shipping_available",
                            event.target.checked
                          )
                        }
                        className="h-5 w-5"
                      />
                      <span className="text-sm font-black">
                        Shipping Available
                      </span>
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3">
                      <input
                        type="checkbox"
                        checked={form.offers_allowed}
                        onChange={(event) =>
                          updateField("offers_allowed", event.target.checked)
                        }
                        className="h-5 w-5"
                      />
                      <span>
                        <span className="block text-sm font-black">
                          Allow buyers to make offers
                        </span>
                        <span className="mt-1 block text-xs font-bold text-stone-600">
                          Uncheck this if you only want buyers to use the future
                          Buy Now option.
                        </span>
                      </span>
                    </label>
                  </div>

                  <label className="mt-5 grid gap-2">
                    <span className="text-sm font-black">
                      Included Accessories
                    </span>
                    <textarea
                      value={form.included_accessories}
                      onChange={(event) =>
                        updateField(
                          "included_accessories",
                          event.target.value
                        )
                      }
                      rows={4}
                      className="rounded-2xl border border-stone-300 bg-white px-4 py-3 font-bold outline-none focus:border-emerald-600"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="cursor-pointer rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/account")}
                    className="cursor-pointer rounded-2xl border border-stone-300 bg-white px-6 py-4 text-sm font-black hover:bg-stone-100"
                  >
                    Back to Account
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