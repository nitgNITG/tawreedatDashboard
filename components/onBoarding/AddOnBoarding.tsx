import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { LoadingIcon, PhotoIcon } from "../icons";
import ErrorMsg from "../ErrorMsg";
import { useTranslations } from "next-intl";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";
import ImageApi from "../ImageApi";
import { useAppDispatch } from "@/hooks/redux";
import {
  addOnBoarding,
  updateOnBoarding,
} from "@/redux/reducers/onBoardsReducer";

const AddOnBoarding = ({
  handleClose,
  board,
}: {
  handleClose: any;
  board?: any;
}) => {
  const t = useTranslations("onBoarding");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const btnRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const { token } = useAppContext();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = document.getElementById("product-id-input-file");
    const btn = btnRef.current;
    const handleClickInput = (e: any) => {
      e.preventDefault();
      input?.click();
    };
    btn?.addEventListener("click", handleClickInput);
    return () => {
      btn?.removeEventListener("click", handleClickInput);
    };
  }, []);
  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);

      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const formdata = new FormData();

      // Add file if exists
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formdata.append("imageUrl", file, "[PROXY]");
      }

      formdata.append("title", formData.title);
      formdata.append("titleAr", formData.titleAr);

      formdata.append("content", formData.content);
      formdata.append("contentAr", formData.contentAr);

      if (board) {
        // Edit existing onboarding
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/on-boarding/${board.id}`,
          {
            method: "PUT",
            headers: myHeaders,
            body: formdata,
            redirect: "follow",
          }
        );

        const textResult = await response.text();
        const jsonData = JSON.parse(textResult);

        if (jsonData.onBoarding) {
          dispatch(updateOnBoarding(jsonData.onBoarding));
          toast.success("OnBoarding updated successfully");
          handleClose();
        } else {
          throw new Error("Invalid response format");
        }
      } else {
        // Add new onboarding
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/on-boarding`,
          {
            method: "POST",
            headers: myHeaders,
            body: formdata,
            redirect: "follow",
          }
        );

        const textResult = await response.text();
        const jsonData = JSON.parse(textResult);

        if (jsonData.onBoarding) {
          dispatch(addOnBoarding(jsonData.onBoarding));
          toast.success("OnBoarding added successfully");
          handleClose();
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (error: any) {
      console.error("Submit Error:", error);
      toast.error(error.message || "Failed to save onboarding");
    } finally {
      setLoading(false);
    }
  });
  return (
    <form className="block" onSubmit={onSubmit}>
      <div className="space-y-5">
        <div className="">
          <input
            type="file"
            multiple
            {...register("imageFile", {
              onChange: (e) => {
                if (e.target.files) {
                  const filesArray = Array.from(e.target.files);
                  const imageUrls = filesArray.map((file) =>
                    URL.createObjectURL(file as any)
                  );
                  setImage(imageUrls as any);
                }
              },
            })}
            id="product-id-input-file"
            className="hidden"
            ref={fileInputRef}
          />
          <>
            {image ? (
              <div className="flex overflow-x-auto h-72 sm:h-52 md:h-64 lg:h-72 ">
                {(image as any).map((image: any) => (
                  <Image
                    key={image}
                    src={image}
                    alt="image"
                    height={1000}
                    width={1000}
                    className="h-full w-full object-cover"
                  />
                ))}
              </div>
            ) : (
              <div>
                <div
                  ref={btnRef}
                  className="cursor-pointer w-full h-72 sm:h-52 md:h-64 lg:h-72 relative flex justify-center items-center group  bg-slate-200"
                >
                  {board ? (
                    <div className="group relative w-full h-full flex justify-center items-center">
                      <ImageApi
                        src={board?.imageUrl}
                        alt="image"
                        height={1000}
                        width={1000}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute w-full h-full bg-slate-100/20 hidden group-hover:flex justify-center items-center duration-100">
                        <PhotoIcon className="size-10" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute w-full h-full bg-slate-100/20 flex justify-center items-center duration-100">
                      <PhotoIcon className="size-10" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        </div>
        <div>
          <input
            {...register("title", {
              value: board?.title,
            })}
            type="text"
            className="border py-3 px-2 w-full outline-none"
            placeholder={t("titlePlaceholder")}
          />
          <ErrorMsg message={errors?.title?.message as string} />
        </div>
        <div>
          <input
            {...register("titleAr", {
              value: board?.titleAr,
            })}
            type="text"
            className="border py-3 px-2 w-full outline-none"
            placeholder={t("titleArPlaceholder")}
          />
          <ErrorMsg message={errors?.titleAr?.message as string} />
        </div>
        <div>
          <textarea
            {...register("content", {
              value: board?.content,
            })}
            className="border py-3 px-2 w-full outline-none h-20"
            placeholder={t("contentPlaceholder")}
          />
          <ErrorMsg message={errors?.content?.message as string} />
        </div>
        <div>
          <textarea
            {...register("contentAr", {
              value: board?.contentAr,
            })}
            className="border py-3 px-2 w-full outline-none h-20"
            placeholder={t("contentArPlaceholder")}
          />
          <ErrorMsg message={errors?.contentAr?.message as string} />
        </div>
        <div className="w-full">
          <button
            disabled={loading}
            className="w-full py-2 rounded-md border-2 border-primary hover:bg-primary hover:text-white duration-200 flex justify-center"
          >
            {loading ? (
              <LoadingIcon className="w-6 h-6 animate-spin hover:stroke-white" />
            ) : (
              t("addButton")
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddOnBoarding;
