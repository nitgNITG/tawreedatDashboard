"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { LoadingIcon, PhotoIcon } from "../icons";
import { useLocale, useTranslations } from "next-intl";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import { useAppDispatch } from "@/hooks/redux";
import {
  addCategory,
  updateCategory,
} from "@/redux/reducers/categoriesReducer";

import ImageApi from "../ImageApi";
import { Category } from "@/app/[locale]/categories/categoriesData";
import FetchSelect from "../FetchSelect";
import fetchCategories from "@/lib/fetchCategories";
import { OutlineInput, OutlineTextArea } from "../ui/OutlineInputs";
import { Checkbox } from "../ui/checkbox";
import {
  Colors,
  Countries,
  fetchColors,
  fetchCountries,
} from "@/lib/fetchCategoryAttr";
import ProductAttributesSection from "./ProductAttributesSection";

interface PopupCategoryProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  category?: Category;
  parentName?: string;
}

const PopupCategory: React.FC<PopupCategoryProps> = ({
  setOpen,
  category,
  parentName,
}) => {
  const [previewImage, setPreviewImage] = useState(category?.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewIcon, setPreviewIcon] = useState(category?.iconUrl || "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isIconLoading, setIsIconLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    setError,
  } = useForm({
    defaultValues: {
      name: category?.name || "",
      nameAr: category?.nameAr || "",
      description: category?.description || "",
      descriptionAr: category?.descriptionAr || "",
      isActive: category?.isActive ?? true,
      parent: category?.parent || undefined,
      productAttributes: category?.productAttributes || {},
    },
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("category");
  const { token } = useAppContext();
  const dispatch = useAppDispatch();

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsImageLoading(true);
        setImageFile(file);
        const tempUrl = URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = tempUrl;
          img.onload = resolve;
          img.onerror = reject;
        });

        setPreviewImage(tempUrl);
      } catch (error) {
        console.error("Error loading image:", error);
        toast.error(t("error.image_load_failed"));
      } finally {
        setIsImageLoading(false);
      }
    }
  };

  const handleIconChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsIconLoading(true);
        setIconFile(file);
        const tempUrl = URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = tempUrl;
          img.onload = resolve;
          img.onerror = reject;
        });

        setPreviewIcon(tempUrl);
      } catch (error) {
        console.error("Error loading icon:", error);
        toast.error(t("error.icon_load_failed"));
      } finally {
        setIsIconLoading(false);
      }
    }
  };
  const lang = useLocale() as "en" | "ar";

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleIconClick = () => {
    iconInputRef.current?.click();
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // if (!category && !previewImage) {
      //   toast.error(t("error.error_image_required"));
      //   return;
      // }

      // if (!formData.name.trim() && !formData.nameAr.trim()) {
      //   toast.error(t("error.error_name_required"));
      //   return;
      // }
      console.log(formData);

      setLoading(true);

      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("nameAr", formData.nameAr);
      submitFormData.append("description", formData.description || "");
      submitFormData.append("descriptionAr", formData.descriptionAr || "");
      submitFormData.append("isActive", String(formData.isActive));
      if (formData.parent)
        submitFormData.append("parentId", String(formData.parent));
      if (imageFile) {
        submitFormData.append("imageUrl", imageFile);
      }
      if (iconFile) {
        submitFormData.append("iconUrl", iconFile);
      }
      if (Object.keys(formData.productAttributes || {}).length > 0) {
        submitFormData.append(
          "productAttributes",
          JSON.stringify(formData.productAttributes)
        );
      }

      const fields =
        "id,name,nameAr,description,descriptionAr,imageUrl,iconUrl,parent=id-name,createdAt,isActive,_count=children-products,productAttributes";

      if (category?.id) {
        const { data } = await axios.put(
          `/api/categories/${category.id}?fields=${fields}`,
          submitFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "accept-language": lang,
            },
          }
        );
        console.log("Category updated:", data);

        dispatch(updateCategory(data.category));
        toast.success(t("success.update"));
      } else {
        const { data } = await axios.post(
          `/api/categories?fields=${fields}`,
          submitFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "accept-language": lang,
            },
          }
        );
        dispatch(addCategory(data.category));
        toast.success(t("success.add"));
      }

      setOpen(false);
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tag: "categories",
          }),
        });
        console.log("Cache revalidated successfully");
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }
    } catch (error: any) {
      if (error.response?.data?.error.includes("categories_name_key")) {
        setError("name", {
          type: "manual",
          message: t("name_exists"),
        });
      }
      console.error("Submit Error:", error);
      toast.error(error?.response?.data?.message || t("error.general"));
    } finally {
      setLoading(false);
    }
  });

  return (
    <form
      className="h-[90%] overflow-auto flex flex-col gap-4 pb-2 px-2"
      onSubmit={onSubmit}
    >
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleImageChange}
        className="hidden"
        accept="image/*"
      />
      <input
        ref={iconInputRef}
        type="file"
        onChange={handleIconChange}
        className="hidden"
        accept="image/*"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Image */}
        <div>
          <h3 className="text-lg font-medium mb-2">{t("mainImage")}</h3>
          <div className="relative h-48">
            <div
              onClick={handleImageClick}
              className="cursor-pointer flex-center rounded-lg overflow-hidden bg-slate-100"
            >
              {isImageLoading ? (
                <div className="flex-center flex-col h-full">
                  <LoadingIcon className="size-10 animate-spin text-primary" />
                  <span className="text-sm text-gray-500 mt-2">
                    {t("loading")}
                  </span>
                </div>
              ) : previewImage ? (
                <div className="relative group h-full flex-center">
                  <ImageApi
                    src={previewImage}
                    alt="Category"
                    height={64}
                    width={48}
                    className="w-48 object-contain rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex-center cursor-pointer rounded-lg">
                    <PhotoIcon className="size-10 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex-center flex-col h-full">
                  <PhotoIcon className="size-10 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">
                    {t("clickToUpload")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Icon Image */}
        <div>
          <h3 className="text-lg font-medium mb-2">{t("iconImage")}</h3>
          <div className="relative h-48">
            <div
              onClick={handleIconClick}
              className="cursor-pointer flex-center rounded-lg overflow-hidden bg-slate-100"
            >
              {isIconLoading ? (
                <div className="flex-center flex-col h-full">
                  <LoadingIcon className="size-10 animate-spin text-primary" />
                  <span className="text-sm text-gray-500 mt-2">
                    {t("loading")}
                  </span>
                </div>
              ) : previewIcon ? (
                <div className="relative group h-full flex-center">
                  <ImageApi
                    src={previewIcon}
                    alt="Category Icon"
                    height={64}
                    width={48}
                    className="w-48 h-full object-contain rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex-center cursor-pointer rounded-lg">
                    <PhotoIcon className="size-10 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex-center flex-col h-full">
                  <PhotoIcon className="size-10 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">
                    {t("uploadIcon")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <OutlineInput
        label={t("name")}
        id="name"
        error={errors.name?.message as string}
        {...register("name", {
          required: t("nameIsRequired"),
        })}
      />
      <OutlineInput
        label={t("nameAr")}
        id="nameAr"
        error={errors.nameAr?.message as string}
        {...register("nameAr")}
      />
      <OutlineTextArea
        id="description"
        label={t("description")}
        error={errors.description?.message as string}
        {...register("description")}
        rows={6}
      />
      <OutlineTextArea
        id="descriptionAr"
        label={t("descriptionAr")}
        error={errors.descriptionAr?.message as string}
        {...register("descriptionAr")}
        rows={6}
      />
      <FetchSelect<Category>
        fieldForm={"parent"}
        label={t("parent_category")}
        fetchFunction={(params) =>
          fetchCategories({
            ...params,
            token,
            lang,
            parentName,
            ...(category ? { notIn: [category.id] } : {}),
          })
        }
        getOptionValue={(item) => item.id}
        getOptionDisplayText={(item) => item.name}
        getOptionLabel={(item) => item.name}
        placeholder={t("placeholder_category_edit_parent")}
        className="w-full"
        errors={errors}
        roles={{ required: false }}
        register={register as any}
        setValue={setValue as any}
        defaultValues={
          category?.parent
            ? [
                {
                  id: category.parent.id ?? 0,
                  name: category.parent.name ?? "",
                  nameAr: category.parent.nameAr ?? "",
                  description: category.parent.description ?? "",
                  imageUrl: category.parent.imageUrl ?? "",
                  parentId: category.parent.parentId ?? undefined,
                  parent: category.parent.parent ?? undefined,
                  children: category.parent.children ?? undefined,
                  isActive: category.parent.isActive ?? true,
                  createdAt: category.parent.createdAt ?? "",
                  updatedAt: category.parent.updatedAt ?? "",
                },
              ]
            : []
        }
      />
      {/* Product Attributes Section */}
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">
          {t("product_attributes")}
        </h3>
        <Controller
          control={control}
          name="productAttributes"
          render={({ field }) => (
            <ProductAttributesSection
              value={field.value || {}}
              onChange={field.onChange}
              token={token}
              lang={lang}
              t={t}
              fetchColors={fetchColors}
              fetchCountries={fetchCountries}
            />
          )}
        />
      </div>
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Checkbox
              id="isActive"
              defaultChecked={category?.isActive ?? true}
              onCheckedChange={(checked) => field.onChange(checked)}
              checked={field.value}
            />
          )}
        />
        <label htmlFor="isActive" className="text-sm cursor-pointer">
          {t("active_status")}
        </label>
      </div>
      <div className="w-full">
        <button
          disabled={loading}
          className="w-full py-2 rounded-md border-2 border-primary hover:bg-primary hover:text-white duration-200 flex justify-center"
        >
          {loading && (
            <LoadingIcon className="size-6 animate-spin hover:stroke-white" />
          )}
          {!loading &&
            (category ? t("button_submit_edit") : t("button_submit_add"))}
        </button>
      </div>
    </form>
  );
};

export default PopupCategory;
