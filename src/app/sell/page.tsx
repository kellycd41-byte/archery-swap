"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
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

const maxPhotoSizeInBytes = 5 * 1024 * 1024;

function makeSafeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
}

export default function SellPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [drawWeight, setDrawWeight] = useState("");
  const [drawLength, setDrawLength] = useState("");
  const [handedness, setHandedness] = useState("");
  const [includedAccessories, setIncludedAccessories] = useState("");
  const [shippingAvailable, setShippingAvailable] = useState(false);

  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function validatePhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      return "Please choose an image file.";
    }

    if (file.size > maxPhotoSizeInBytes) {
      return "Please choose a photo smaller than 5 MB.";
    }

    return "";
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setSuccessMessage("");
    setErrorMessage("");

    const file = event.target.files?.[0];

    if (!file) {
      setSelectedPhotoName("");
      setPhotoPreviewUrl("");
      return;
    }

    const photoError = validatePhoto(file);

    if (photoError) {
      setSelectedPhotoName("");
      setPhotoPreviewUrl("");
      setErrorMessage(photoError);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedPhotoName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoPreviewUrl(typeof reader.result === "string" ? reader.result : "");
    };

    reader.readAsDataURL(file);
  }

  async function uploadListingPhoto() {
    const selectedPhoto = fileInputRef.current?.files?.[0];

    if (!selectedPhoto) {
      return null;
    }

    const photoError = validatePhoto(selectedPhoto);

    if (photoError) {
      throw new Error(photoError);
    }

    const safeFileName = makeSafeFileName(selectedPhoto.name);
    const filePath = `public/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(filePath, selectedPhoto, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Photo upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("listing-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const cleanedPrice = Number(price.replace(/[^0-9.]/g, ""));

    if (!title.trim()) {
      setErrorMessage("Please enter an item title.");
      return;
    }

    if (!category) {
      setErrorMessage("Please select a category.");
      return;
    }

    if (!condition) {
      setErrorMessage("Please select a condition.");
      return;
    }

    if (!cleanedPrice || cleanedPrice <= 0) {
      setErrorMessage("Please enter a valid price.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please enter a description.");
      return;
    }

    setIsSubmitting(true);

    try {
      const photoUrl = await uploadListingPhoto();

      const { error } = await supabase.from("listings").insert({
        title: title.trim(),
        description: description.trim(),
        price: cleanedPrice,
        category,
        condition,
        location: location.trim() || null,
        seller_name: sellerName.trim() || null,
        seller_email: sellerEmail.trim() || null,
        brand: brand.trim() || null,
        model: model.trim() || null,
        draw_weight: drawWeight.trim() || null,
        draw_length: drawLength.trim() || null,
        handedness: handedness || null,
        included_accessories: includedAccessories.trim() || null,
        shipping_available: shippingAvailable,
        image_url: photoUrl,
        status: "pending",
        denial_reason: null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage(
        "Your listing was submitted successfully and is waiting for admin approval."
      );

      setTitle("");
      setCategory("");
      setCondition("");
      setPrice("");
      setLocation("");
      setDescription("");
      setSellerName("");
      setSellerEmail("");
      setBrand("");
      setModel("");
      setDrawWeight("");
      setDrawLength("");
      setHandedness("");
      setIncludedAccessories("");
      setShippingAvailable(false);
      setSelectedPhotoName("");
      setPhotoPreviewUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your listing."
      );
    }

    setIsSubmitting(false);
  }

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
            <Link href="/sell" className="text-emerald-300">
              Sell Gear
            </Link>
            <Link href="/messages" className="hover:text-emerald-300">
              Messages
            </Link>
            <Link href="/account" className="hover:text-emerald-300">
              Account
            </Link>
          </nav>

          <Link
            href="/browse"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
          >
            Browse Gear
          </Link>
        </div>
      </header>

      <section className="bg-stone-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Sell Gear
          </p>

          <h2 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">
            List your archery gear for sale.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Submit your listing with archery-specific details and one clear
            photo. Listings are reviewed before they appear in Browse.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <h3 className="text-3xl font-black">Create a listing</h3>
            <p className="mt-2 text-stone-600">
              Add the details a buyer needs to understand exactly what you are
              selling. After submitting, your listing will wait for admin
              approval before it appears in Browse.
            </p>
          </div>

          {successMessage ? (
            <div className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="rounded-2xl border border-stone-200 p-5">
              <h4 className="text-xl font-black">Basic details</h4>

              <div className="mt-5">
                <label className="text-sm font-black text-stone-700">
                  Item title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Example: Mathews V3X 33 Compound Bow"
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-black text-stone-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                  >
                    <option value="">Select a category</option>
                    {categories.map((categoryOption) => (
                      <option key={categoryOption} value={categoryOption}>
                        {categoryOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-black text-stone-700">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(event) => setCondition(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                  >
                    <option value="">Select condition</option>
                    {conditions.map((conditionOption) => (
                      <option key={conditionOption} value={conditionOption}>
                        {conditionOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-black text-stone-700">
                    Price
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="$875"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-stone-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Pennsylvania"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 p-5">
              <h4 className="text-xl font-black">Archery specs</h4>
              <p className="mt-1 text-sm text-stone-600">
                These fields help buyers compare gear faster.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-black text-stone-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                    placeholder="Example: Mathews"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-stone-700">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(event) => setModel(event.target.value)}
                    placeholder="Example: V3X 33"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
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
                    value={drawWeight}
                    onChange={(event) => setDrawWeight(event.target.value)}
                    placeholder="Example: 60-70 lbs"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-stone-700">
                    Draw length
                  </label>
                  <input
                    type="text"
                    value={drawLength}
                    onChange={(event) => setDrawLength(event.target.value)}
                    placeholder="Example: 28.5 in"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-stone-700">
                    Handedness
                  </label>
                  <select
                    value={handedness}
                    onChange={(event) => setHandedness(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                  >
                    <option value="">Select handedness</option>
                    {handednessOptions.map((handednessOption) => (
                      <option key={handednessOption} value={handednessOption}>
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
                  value={includedAccessories}
                  onChange={(event) =>
                    setIncludedAccessories(event.target.value)
                  }
                  placeholder="Example: Sight, rest, quiver, stabilizer, case, arrows."
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 p-5">
              <h4 className="text-xl font-black">Seller and shipping</h4>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-black text-stone-700">
                    Seller name
                  </label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(event) => setSellerName(event.target.value)}
                    placeholder="Your name"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-stone-700">
                    Seller email
                  </label>
                  <input
                    type="email"
                    value={sellerEmail}
                    onChange={(event) => setSellerEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-stone-300 bg-stone-50 p-4">
                <input
                  type="checkbox"
                  checked={shippingAvailable}
                  onChange={(event) =>
                    setShippingAvailable(event.target.checked)
                  }
                  className="mt-1"
                />
                <span>
                  <span className="block font-black">
                    Shipping is available
                  </span>
                  <span className="mt-1 block text-sm text-stone-600">
                    Check this if you are willing to ship this item to a buyer.
                  </span>
                </span>
              </label>
            </section>

            <section className="rounded-2xl border border-stone-200 p-5">
              <h4 className="text-xl font-black">Description and photo</h4>

              <div className="mt-5">
                <label className="text-sm font-black text-stone-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the item, condition, included accessories, draw weight, draw length, age, and anything buyers should know."
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="mt-5">
                <p className="text-sm font-black text-stone-700">Photo</p>

                <label className="mt-2 block cursor-pointer rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center hover:border-emerald-700 hover:bg-emerald-50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />

                  <span className="inline-block rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white">
                    Choose Photo
                  </span>

                  <span className="mt-3 block text-sm font-bold text-stone-700">
                    Click here to upload one clear photo.
                  </span>

                  <span className="mt-1 block text-xs text-stone-500">
                    JPG, PNG, WEBP, or GIF. Max size: 5 MB.
                  </span>
                </label>

                {selectedPhotoName ? (
                  <p className="mt-3 text-sm font-bold text-stone-700">
                    Selected: {selectedPhotoName}
                  </p>
                ) : null}

                {photoPreviewUrl ? (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-stone-300 bg-white">
                    <img
                      src={photoPreviewUrl}
                      alt="Selected listing photo preview"
                      className="h-72 w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </section>

            <div className="rounded-2xl bg-stone-100 p-5">
              <h4 className="font-black">Listing safety checklist</h4>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li>• Use clear photos from multiple angles.</li>
                <li>• Be honest about wear, damage, or missing parts.</li>
                <li>• Include important bow specs when possible.</li>
                <li>• Your listing will be reviewed before it appears in Browse.</li>
                <li>• Do not share payment info outside the platform.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isSubmitting ? "Submitting Listing..." : "Submit Listing"}
              </button>

              <button
                type="button"
                className="rounded-xl border border-stone-400 px-6 py-3 font-black text-stone-950 hover:bg-stone-100"
              >
                Save Draft Later
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}