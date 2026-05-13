"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
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

export default function SellPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

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
  const [offersAllowed, setOffersAllowed] = useState(true);

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<PhotoPreview[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      const signedInUser = data.session?.user ?? null;

      setUser(signedInUser);

      if (signedInUser?.email) {
        setSellerEmail(signedInUser.email);
      }

      setIsLoadingSession(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const signedInUser = session?.user ?? null;

      setUser(signedInUser);

      if (signedInUser?.email) {
        setSellerEmail(signedInUser.email);
      } else {
        setSellerEmail("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

    if (!user) {
      setErrorMessage("Please sign in before submitting a listing.");
      return;
    }

    const cleanedPrice = Number(price.replace(/[^0-9.]/g, ""));
    const cleanedSellerEmail = user.email?.trim() || sellerEmail.trim();

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

    if (!cleanedSellerEmail) {
      setErrorMessage("Your signed-in account needs an email address.");
      return;
    }

    if (!cleanedSellerEmail.includes("@")) {
      setErrorMessage("Your signed-in account email is not valid.");
      return;
    }

    setIsSubmitting(true);

    try {
      const photoUrls = await uploadListingPhotos();
      const firstPhotoUrl = photoUrls[0] || null;

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        price: cleanedPrice,
        category,
        condition,
        location: location.trim() || null,
        seller_name: sellerName.trim() || null,
        seller_email: cleanedSellerEmail,
        brand: brand.trim() || null,
        model: model.trim() || null,
        draw_weight: drawWeight.trim() || null,
        draw_length: drawLength.trim() || null,
        handedness: handedness || null,
        included_accessories: includedAccessories.trim() || null,
        shipping_available: shippingAvailable,
        offers_allowed: offersAllowed,
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
      setSellerEmail(user.email || "");
      setBrand("");
      setModel("");
      setDrawWeight("");
      setDrawLength("");
      setHandedness("");
      setIncludedAccessories("");
      setShippingAvailable(false);
      setOffersAllowed(true);
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
      <Header activePage="sell" />

      <section className="bg-stone-950 px-4 py-12 text-white sm:px-6 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">
              Sell Gear
            </p>

            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
              List archery gear with the details buyers actually need.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Add clear photos, honest condition notes, important bow specs, and
              shipping details. New listings are reviewed before they appear in
              Browse.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
              Listing basics
            </p>

            <div className="mt-4 grid gap-3 text-sm font-bold text-stone-200">
              <div className="rounded-2xl bg-white/10 p-4">
                Up to {maxPhotoCount} photos
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                5 MB max per photo
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                Reviewed before public
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {isLoadingSession ? (
          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm">
            <p className="font-black">Checking sign-in status...</p>
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-800">
                Sign In Required
              </p>

              <h3 className="mt-4 text-3xl font-black tracking-tight text-stone-950">
                Sign in before listing gear.
              </h3>

              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
                Archery Swap connects each new listing to the seller account
                that created it. This is needed for seller tools, messages,
                offers, and future checkout.
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
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
                  Signed in seller
                </p>

                <p className="mt-4 break-words text-sm font-bold leading-6 text-stone-700">
                  You are listing gear as:
                </p>

                <p className="mt-2 break-words rounded-2xl bg-stone-100 p-4 text-sm font-black text-stone-950">
                  {user.email}
                </p>

                <p className="mt-4 text-sm leading-6 text-stone-600">
                  This listing will be connected to your account so buyers can
                  message you and make offers.
                </p>
              </div>

              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800">
                  Before you submit
                </p>

                <ul className="mt-4 space-y-3 text-sm font-bold leading-6 text-emerald-950">
                  <li>• Required fields are marked clearly.</li>
                  <li>• Add clear photos from multiple angles if possible.</li>
                  <li>• JPG, PNG, WEBP, and GIF photos work right now.</li>
                  <li>• HEIC iPhone photos are not supported yet.</li>
                  <li>• Listings are approved before showing publicly.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-stone-500">
                  Seller checklist
                </p>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                  <li>• Show wear, damage, and missing parts clearly.</li>
                  <li>• Include draw weight and draw length when possible.</li>
                  <li>• Do not share payment information in the listing.</li>
                  <li>• Use messages for buyer questions.</li>
                </ul>
              </div>
            </aside>

            <div className="rounded-3xl border border-stone-300 bg-white p-5 shadow-sm sm:p-6 md:p-8">
              <div className="mb-8 border-b border-stone-200 pb-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
                  Create Listing
                </p>

                <h3 className="mt-3 text-3xl font-black tracking-tight">
                  Tell buyers what you are selling.
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                  Fill out the main information first, then add specs, shipping,
                  offers, description, and photos.
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-black">Basic details</h4>
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        This is the main information buyers see first.
                      </p>
                    </div>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
                      Required
                    </span>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-black text-stone-700">
                      Item title <span className="text-red-700">Required</span>
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Example: Mathews V3X 33 Compound Bow"
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Category <span className="text-red-700">Required</span>
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
                        Condition{" "}
                        <span className="text-red-700">Required</span>
                      </label>

                      <select
                        value={condition}
                        onChange={(event) => setCondition(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                      >
                        <option value="">Select condition</option>
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

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-black text-stone-700">
                        Price <span className="text-red-700">Required</span>
                      </label>

                      <input
                        type="text"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="$875"
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
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
                        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 p-5">
                  <h4 className="text-xl font-black">Archery specs</h4>

                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Optional, but very helpful for bows and technical gear.
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

                <section className="rounded-3xl border border-stone-200 p-5">
                  <h4 className="text-xl font-black">
                    Seller, shipping, and offers
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Your seller email comes from your signed-in account.
                  </p>

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
                        disabled
                        className="mt-2 w-full cursor-not-allowed rounded-xl border border-stone-300 bg-stone-100 px-4 py-3 font-bold text-stone-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="flex items-start gap-3 rounded-2xl border border-stone-300 bg-stone-50 p-4">
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

                        <span className="mt-1 block text-sm leading-6 text-stone-600">
                          Check this if you are willing to ship this item to a
                          buyer.
                        </span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-stone-300 bg-stone-50 p-4">
                      <input
                        type="checkbox"
                        checked={offersAllowed}
                        onChange={(event) =>
                          setOffersAllowed(event.target.checked)
                        }
                        className="mt-1"
                      />

                      <span>
                        <span className="block font-black">
                          Allow buyers to make offers
                        </span>

                        <span className="mt-1 block text-sm leading-6 text-stone-600">
                          Leave this checked if you are open to offers. Uncheck
                          it if you only want the future Buy Now option.
                        </span>
                      </span>
                    </label>
                  </div>
                </section>

                <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-black">
                        Description and photos
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        Good photos and honest notes help buyers trust the
                        listing.
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
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Describe the item, condition, included accessories, draw weight, draw length, age, and anything buyers should know."
                      rows={6}
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-black text-stone-700">
                        Photos
                      </p>

                      <p className="text-xs font-bold text-stone-500">
                        {photoPreviewUrls.length}/{maxPhotoCount} selected
                      </p>
                    </div>

                    <label className="mt-2 block cursor-pointer rounded-3xl border-2 border-dashed border-stone-300 bg-white p-6 text-center hover:border-emerald-700 hover:bg-emerald-50">
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
                        Add up to {maxPhotoCount} photos. You can choose more
                        than one photo at a time.
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-stone-500">
                        JPG, PNG, WEBP, or GIF. Max size: 5 MB each. HEIC is not
                        supported yet.
                      </span>
                    </label>

                    {photoPreviewUrls.length > 0 ? (
                      <div className="mt-5">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <p className="text-sm font-black text-stone-700">
                            Selected photos: {photoPreviewUrls.length}/
                            {maxPhotoCount}
                          </p>

                          <button
                            type="button"
                            onClick={resetPhotoSelection}
                            className="cursor-pointer text-sm font-black text-red-700 hover:text-red-600"
                          >
                            Remove all
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                                  className="mt-2 cursor-pointer text-xs font-black text-red-700 hover:text-red-600"
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

                <div className="flex flex-col gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-stone-600">
                    After submitting, the listing will stay pending until it is
                    approved.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {isSubmitting
                      ? "Submitting Listing..."
                      : "Submit Listing for Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}