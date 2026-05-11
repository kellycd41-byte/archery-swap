"use client";

import { useState } from "react";

type ListingPhotoGalleryProps = {
  photos: string[];
  title: string;
};

export default function ListingPhotoGallery({
  photos,
  title,
}: ListingPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(photos[0] || "");

  if (photos.length === 0) {
    return (
      <div className="relative flex h-[440px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-950 via-stone-800 to-emerald-950 px-5 text-center">
        <div className="absolute left-8 top-8 h-20 w-20 rounded-full border border-emerald-300/20" />
        <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full border border-white/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />

        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/40 bg-white/10 text-3xl">
            🎯
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-emerald-200">
            No Photo Yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[440px] items-center justify-center overflow-hidden rounded-2xl bg-stone-100">
        <img
          src={selectedPhoto}
          alt={title}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {photos.map((photoUrl, index) => {
          const isSelected = photoUrl === selectedPhoto;

          return (
            <button
              key={`${photoUrl}-${index}`}
              type="button"
              onClick={() => setSelectedPhoto(photoUrl)}
              className={`flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-xl border bg-stone-100 ${
                isSelected
                  ? "border-emerald-600 ring-2 ring-emerald-600"
                  : "border-stone-300 hover:border-emerald-500"
              }`}
              aria-label={`Show photo ${index + 1}`}
            >
              <img
                src={photoUrl}
                alt={`${title} photo ${index + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </button>
          );
        })}
      </div>
    </>
  );
}