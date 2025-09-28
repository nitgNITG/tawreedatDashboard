"use client";
import React, { useState } from "react";

interface ImageUploadProps {
  label: string;
  onChange: (file: File) => void;
  preview?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  onChange,
  preview,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(preview || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  return (
    <div className="flex flex-col px-5 py-6 bg-white rounded-md border border-gray-200 border-solid h-[120px] w-[120px]  drop-shadow-xl border-gray-700/50 hover:scale-95 hover:text-primary/70 hover:border-primary">
      <label className="cursor-pointer flex flex-col items-center justify-center h-full ">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreview ? (
          <img
            src={imagePreview}
            alt={label}
            className="object-cover w-full h-full rounded-md"
          />
        ) : (
          <>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/c6eff137ff7f402eb24270a4bf4049e8/738940be87e4fdca93616fd000410520053d26823e8620769ade7f3ece4a8a40"
              className="object-contain self-center aspect-[1.04] w-[26px] mb-2"
              alt={`Upload ${label}`}
            />
            <span className="text-xs text-center">{label}</span>
          </>
        )}
      </label>
    </div>
  );
};
