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
const maxPhotoCount = 8;

type PhotoPreview = {
  name: string;
  url: string;
};

function makeSafeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "-")
    .replace(/-+/g, "-");
}

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

          <div className="hidden md:block">
            <Link
              href="/browse"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500"
            >
              Browse Gear
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
                className="block border-b border-stone-800 bg-stone-800 px-4 py-3 text-sm font-bold text-emerald-300"
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

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<PhotoPreview[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function validatePhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      return "Please choose image files only.";
    }

    if (file.size > maxPhotoSizeInBytes) {
      return "Each photo must be smaller than 5 MB.";
    }

    return "";
  }

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetPhotoSelection() {
    setSelectedPhotos([]);
    setPhotoPreviewUrls([]);
    resetFileInput();
  }

  function removePhoto(indexToRemove: number) {
    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((_, index) => index !== indexToRemove)
    );

    setPhotoPreviewUrls((currentPreviews) =>
      currentPreviews.filter((_, index) => index !== indexToRemove)
    );

    resetFileInput();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setSuccessMessage("");
    setErrorMessage("");

    const newFiles = Array.from(event.target.files || []);

    if (newFiles.length === 0) {
      resetFileInput();
      return;
    }

    for (const file of newFiles) {
      const photoError = validatePhoto(file);

      if (photoError) {
        setErrorMessage(photoError);
        resetFileInput();
        return;
      }
    }

    const remainingSlots = maxPhotoCount - selectedPhotos.length;

    if (remainingSlots <= 0) {
      setErrorMessage(`You can upload up to ${maxPhotoCount} photos.`);
      resetFileInput();
      return;
    }

    const filesToAdd = newFiles.slice(0, remainingSlots);

    if (newFiles.length > remainingSlots) {
      setErrorMessage(
        `Only ${remainingSlots} more photo${
          remainingSlots === 1 ? "" : "s"
        } can be added. The extra photos were not added.`
      );
    }

    const previewPromises = filesToAdd.map(
      (file) =>
        new Promise<PhotoPreview>((resolve) => {
          const reader = new FileReader();

          reader.onload = () => {
            resolve({
              name: file.name,
              url: typeof reader.result === "string" ? reader.result : "",
            });
          };

          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((newPreviews) => {
      setSelectedPhotos((currentPhotos) => [...currentPhotos, ...filesToAdd]);
      setPhotoPreviewUrls((currentPreviews) => [
        ...currentPreviews,
        ...newPreviews.filter((preview) => preview.url),
      ]);
      resetFileInput();
    });
  }

  async function uploadListingPhotos() {
    if (selectedPhotos.length === 0) {
      return [];
    }

    if (selectedPhotos.length > maxPhotoCount) {
      throw new Error(`Please choose no more than ${maxPhotoCount} photos.`);
    }

    const uploadedUrls: string[] = [];

    for (const selectedPhoto of selectedPhotos) {
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

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
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
      const photoUrls = await uploadListingPhotos();
      const firstPhotoUrl = photoUrls[0] || null;

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
        image_url: firstPhotoUrl,
        image_urls: photoUrls,
        status: "pending",
        denial_reason: null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage(
        "Your listing was submitted successfully and is waiting for approval."
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
      resetPhotoSelection();
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
      <Header />

      <section className="bg-stone-950 px-4 py-14 text-white sm:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
            Sell Gear
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            List your archery gear for sale.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            Submit your listing with archery-specific details and clear photos.
            Listings are reviewed before they appear in Browse.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="mb-8">
            <h3 className="text-3xl font-black">Create a listing</h3>
            <p className="mt-2 text-stone-600">
              Add the details a buyer needs to understand exactly what you are
              selling. After submitting, your listing will wait for approval
              before it appears in Browse.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h4 className="font-black text-emerald-950">
              Before you submit
            </h4>
            <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-emerald-900">
              <li>• Add clear photos from multiple angles if possible.</li>
              <li>• JPG, PNG, WEBP, and GIF photos work right now.</li>
              <li>• HEIC iPhone photos are not supported yet.</li>
              <li>• New listings must be approved before they show publicly.</li>
            </ul>
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
              <h4 className="text-xl font-black">Description and photos</h4>

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
                <p className="text-sm font-black text-stone-700">Photos</p>

                <label className="mt-2 block cursor-pointer rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center hover:border-emerald-700 hover:bg-emerald-50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />

                  <span className="inline-block rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white">
                    Choose Photos
                  </span>

                  <span className="mt-3 block text-sm font-bold text-stone-700">
                    Click here to add up to {maxPhotoCount} clear photos.
                  </span>

                  <span className="mt-1 block text-xs text-stone-500">
                    JPG, PNG, WEBP, or GIF. Max size: 5 MB each. HEIC is not
                    supported yet.
                  </span>
                </label>

                {photoPreviewUrls.length > 0 ? (
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <p className="text-sm font-black text-stone-700">
                        Selected photos: {photoPreviewUrls.length}/{maxPhotoCount}
                      </p>

                      <button
                        type="button"
                        onClick={resetPhotoSelection}
                        className="text-sm font-black text-red-700 hover:text-red-600"
                      >
                        Remove all
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {photoPreviewUrls.map((preview, index) => (
                        <div
                          key={`${preview.name}-${index}`}
                          className="overflow-hidden rounded-2xl border border-stone-300 bg-stone-100"
                        >
                          <div className="flex h-48 items-center justify-center">
                            <img
                              src={preview.url}
                              alt={`${preview.name} preview`}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          <div className="border-t border-stone-300 bg-white px-3 py-2">
                            <p className="truncate text-xs font-bold text-stone-600">
                              {preview.name}
                            </p>

                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="mt-2 text-xs font-black text-red-700 hover:text-red-600"
                            >
                              Remove photo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="rounded-2xl bg-stone-100 p-5">
              <h4 className="font-black">Listing safety checklist</h4>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li>• Use clear photos that show the item well.</li>
                <li>• Be honest about wear, damage, or missing parts.</li>
                <li>• Include important bow specs when possible.</li>
                <li>• Your listing will be reviewed before it appears in Browse.</li>
                <li>• Do not share payment information in your listing.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-stone-400 sm:w-auto"
            >
              {isSubmitting ? "Submitting Listing..." : "Submit Listing for Review"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}