"use client";
import React from "react";
import { Edit, Camera, Trash2 } from "lucide-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import Image from "next/image";

interface ProfileImageUploadProps<T extends FieldValues = FieldValues> {
  imagePreview: string | null;
  fieldForm: Path<T>;
  setImagePreview: (preview: string | null) => void;
  register: UseFormRegister<T>;
  onDeleteImage: () => void;
  deleteImage: boolean;
  setDeleteImage: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileImageUpload = <T extends FieldValues>({
  imagePreview,
  fieldForm,
  setImagePreview,
  register,
  onDeleteImage,
  deleteImage,
  setDeleteImage,
}: ProfileImageUploadProps<T>) => {
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white text-center">
      <div className="relative mx-auto w-32 h-32 mb-4">
        <input
          type="file"
          accept="image/*"
          {...register(fieldForm, {
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) {
                setImagePreview(URL.createObjectURL(file));
                setDeleteImage(false); // Reset delete state when a new image is uploaded
              }
            },
          })}
          id={fieldForm}
          className="hidden"
        />

        <div className="size-full rounded-full overflow-hidden border-4 border-white shadow-lg">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Profile image"
              height={128}
              width={128}
              priority
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-white/20 flex items-center justify-center">
              <Camera className="size-8 text-white" />
            </div>
          )}
        </div>

        {/* Edit/Upload Button */}
        <label
          htmlFor={fieldForm}
          className="absolute bottom-0 right-0 bg-white text-primary p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-lg"
        >
          <Edit className="size-4" />
        </label>

        {/* Delete Button */}
        {imagePreview && !deleteImage && (
          <button
            type="button"
            onClick={onDeleteImage}
            className="absolute bottom-0 left-0 bg-red-500 text-white p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors shadow-lg"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
