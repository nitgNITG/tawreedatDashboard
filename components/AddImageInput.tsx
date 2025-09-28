import React, { useRef } from "react";
import Image from "next/image";
import { Cross, Edit } from "lucide-react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import clsx from "clsx";

interface AddImageInputProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  fieldForm: Path<T>;
  required?: boolean | string;
  text: string;
  imagePreview: string | null;
  setImagePreview: (value: string | null) => void;
}

const AddImageInput = <T extends FieldValues>({
  register,
  text,
  imagePreview,
  required = false,
  fieldForm,
  setImagePreview,
}: AddImageInputProps<T>) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      className={clsx(
        "size-full border-[#E9E9E9] rounded-md border",
        !imagePreview &&
          "hover:scale-95 focus-within:scale-95 transition-transform"
      )}
    >
      <input
        type="file"
        accept="image/*"
        id={fieldForm}
        {...register(fieldForm, {
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
              setImagePreview(URL.createObjectURL(file));
            }
          },
          required,
        })}
        ref={(e) => {
          inputRef.current = e;
          register(fieldForm).ref(e);
        }}
        className="hidden"
      />
      {!imagePreview ? (
        <button
          type="button"
          className="flex-center flex-col gap-2 cursor-pointer size-full"
          onClick={() => inputRef.current?.click()}
          aria-label={`Upload ${text}`}
        >
          <span className="size-10 bg-primary rounded-full grid place-content-center">
            <Cross color="white" fill="white" className="size-5" />
          </span>
          <span>{text}</span>
        </button>
      ) : (
        <div className="size-full grid place-content-center relative">
          <Image
            src={imagePreview}
            alt="Uploaded Image"
            fill
            className="object-contain rounded-md"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
          <button
            type="button"
            className="absolute top-2 end-2 bg-white p-1 rounded-full shadow-md cursor-pointer hover:scale-95 transition-transform focus-within:scale-95"
            aria-label={`Change ${text}`}
            onClick={() => inputRef.current?.click()}
          >
            <Edit className="text-primary size-5 hover:text-primary/70 transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AddImageInput;
