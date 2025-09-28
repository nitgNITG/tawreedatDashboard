"use client";
import ImageApi from "@/components/ImageApi";
import { User } from "@/redux/reducers/usersReducer";
import { Edit, Trash2 } from "lucide-react";
import { FieldValues, UseFormRegister } from "react-hook-form";

type userBadge = {
  user: User;
  image: string;
  setImage: (image: string) => void;
  register: UseFormRegister<FieldValues>;
  handleFieldClick?: () => void;
  onDeleteImage?: () => void;
  deleteImage?: boolean;
};

const UserBadge = ({
  user,
  image,
  setImage,
  register,
  handleFieldClick,
  onDeleteImage,
  deleteImage,
}: userBadge) => {
  const userTypeCover = "#02161E";

  const { fullname, email, phone, imageUrl } = user;

  return (
    <div
      style={{ background: userTypeCover }}
      className="h-[200px] !bg-center !bg-cover !bg-no-repeat w-full border-1 rounded-xl flex justify-center items-center gap-1 flex-col"
    >
      <div className="relative rounded-full h-20">
        <input
          type="file"
          accept="image/*"
          {...register("imageFile", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(URL.createObjectURL(file));
              }
            },
          })}
          id="imageFile"
          className="hidden"
          onClick={handleFieldClick}
        />
        {image && (
          <>
            <ImageApi
              src={image}
              alt="user image"
              height={200}
              width={200}
              priority
              className="rounded-full size-full"
            />
            <button
              type="button"
              onClick={() => {
                setImage("");
                // Reset the file input
                const fileInput = document.getElementById(
                  "imageFile"
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
              }}
              className="absolute bottom-0 right-0 z-10 rounded bg-red-500 text-white cursor-pointer p-1 hover:bg-red-600 transition-colors"
              title="Remove selected image"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
        {!image && (
          <>
            <ImageApi
              src={
                deleteImage
                  ? "/imgs/avatar.png"
                  : (imageUrl ?? "/imgs/avatar.png")
              }
              key={
                deleteImage
                  ? "/imgs/avatar.png"
                  : (imageUrl ?? "/imgs/avatar.png")
              }
              loader={() =>
                deleteImage
                  ? "/imgs/avatar.png"
                  : (imageUrl ?? "/imgs/avatar.png")
              }
              alt="user image"
              height={200}
              width={200}
              priority
              className="rounded-full size-full"
            />
            <label
              htmlFor="imageFile"
              className="absolute bottom-0 right-0 z-10 rounded bg-white text-black cursor-pointer p-1"
            >
              <Edit className="size-4" />
            </label>
            {imageUrl && onDeleteImage && !deleteImage && (
              <button
                type="button"
                onClick={onDeleteImage}
                className="absolute bottom-0 left-0 z-10 rounded bg-red-500 text-white cursor-pointer p-1 hover:bg-red-600 transition-colors"
                title="Delete image"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </>
        )}
      </div>
      <h4 className="text-white">{fullname}</h4>
      <h5 className="text-xs font-light text-white">{email}</h5>
      <h6 className="text-xs font-light text-white">{phone}</h6>
    </div>
  );
};

export default UserBadge;
