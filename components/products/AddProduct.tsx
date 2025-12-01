"use client";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LoadingIcon, PhotoIcon } from "../icons";
import { useLocale, useTranslations } from "next-intl";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import { useAppDispatch } from "@/hooks/redux";
import { addProduct, updateProduct } from "@/redux/reducers/productsReducer";
import { OutlineInput, OutlineTextArea } from "../ui/OutlineInputs";
import { Product } from "@/app/[locale]/products/productsData";
import ImageApi from "../ImageApi";
import fetchCategories from "@/lib/fetchCategories";
import FetchSelect from "../FetchSelect";
import { Category } from "@/app/[locale]/categories/categoriesData";
import { Checkbox } from "../ui/checkbox";
import ProductAttributeItem from "./ProductAttributeItem";
import { Brand } from "@/app/[locale]/brands/page";
import { fetchBrands } from "@/lib/fetchBrands";

interface AttributesItem {
  key: string;
  value: string;
}

export interface ProductForm {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  images?: string[];
  price: number;
  //   costPrice?: number;
  offer?: number;
  offerValidFrom?: string;
  offerValidTo?: string;
  stock: number;
  //   minStock?: number;
  //   weight?: number;
  //   dimensions?: string;
  isActive: boolean;
  category?: Pick<Category, "id" | "name" | "nameAr" | "productAttributes">;
  isFeatured: boolean;
  attributes?: AttributesItem[];
  brand?: Pick<Brand, "id" | "name" | "nameAr" | "logoUrl">;
  //   supplierId?: number;
}

const PopupProduct = ({
  setOpen,
  product,
  categoryName,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product?: Product;
  categoryName?: string;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ProductForm>({
    defaultValues: {
      name: product?.name || undefined,
      nameAr: product?.nameAr || undefined,
      price: product?.price || undefined,
      offer: product?.offer || undefined,
      offerValidFrom: product?.offerValidFrom || undefined,
      offerValidTo: product?.offerValidTo || undefined,
      stock: product?.stock || undefined,
      description: product?.description || undefined,
      descriptionAr: product?.descriptionAr || undefined,
      category: product?.category || undefined,
      isActive: product?.isActive || true,
      isFeatured: product?.isFeatured || false,
      attributes: product?.attributes || [],
      brand: product?.brand || undefined,
    },
  });
  const dispatch = useAppDispatch();

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [newImages, setNewImages] = useState<File[]>([]); // new files to upload
  const [deletedImages, setDeletedImages] = useState<string[]>([]); // URLs to delete
  const [replaceAll, setReplaceAll] = useState(false); // replace all images
  const [loading, setLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [categoryAttributes, setCategoryAttributes] = useState<{
    [key: string]: {
      type: "string" | "number" | "boolean";
      required?: boolean;
      default?: string | number | boolean;
      enum?: string[] | number[];
    };
  }>(product?.category?.productAttributes ?? {});
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const replaceAllInputRef = useRef<HTMLInputElement>(null);

  const lang = useLocale() as "en" | "ar";

  const handleImageClick = () => imagesInputRef.current?.click();
  const t = useTranslations("products");
  const { token } = useAppContext();

  const offerValue = watch("offer");
  const validFromValue = watch("offerValidFrom");

  // Add new images (append)
  const handleAddImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsImageLoading(true);
      try {
        const urls: string[] = [];
        for (const file of Array.from(files)) {
          const tempUrl = URL.createObjectURL(file);
          await new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = tempUrl;
            img.onload = resolve;
            img.onerror = reject;
          });
          urls.push(tempUrl);
        }
        setNewImages((prev) => [...prev, ...Array.from(files)]);
        setImages((prev) => [...prev, ...urls]);
      } finally {
        setIsImageLoading(false);
      }
    }
  };

  // Replace all images
  const handleReplaceAllImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsImageLoading(true);
      try {
        const urls: string[] = [];
        for (const file of Array.from(files)) {
          const tempUrl = URL.createObjectURL(file);
          await new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = tempUrl;
            img.onload = resolve;
            img.onerror = reject;
          });
          urls.push(tempUrl);
        }
        setReplaceAll(true);
        setNewImages(Array.from(files));
        setImages(urls);
        setDeletedImages(product?.images ?? []); // mark all old images for deletion
      } finally {
        setIsImageLoading(false);
      }
    }
  };

  // Replace specific image
  const handleReplaceImage = async (
    idx: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImageLoading(true);
      try {
        const tempUrl = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          const imgObj = new window.Image();
          imgObj.src = tempUrl;
          imgObj.onload = resolve;
          imgObj.onerror = reject;
        });
        setImages((prev) => prev.map((old, i) => (i === idx ? tempUrl : old)));
        setNewImages((prev) => {
          const arr = [...prev];
          arr[idx] = file;
          return arr;
        });
        // If replacing an old image, mark it for deletion
        if (product?.images && product.images[idx] !== undefined) {
          setDeletedImages((prev) => [...prev, product.images![idx]]);
        }
      } finally {
        setIsImageLoading(false);
      }
    }
  };

  // Delete specific image
  const handleDeleteImage = (idx: number) => {
    if (product?.images && product.images[idx] !== undefined) {
      setDeletedImages((prev) => [...prev, product.images![idx]]);
    }
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // In AddProduct.tsx, update your onSubmit function:
  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      const params =
        "id,name,nameAr,description,descriptionAr,attributes,images,price,stock,createdAt,isActive,isFeatured,offer,offerValidFrom,offerValidTo,rating,totalReviews,category=id-name-nameAr-productAttributes,brand=id-name-nameAr-logoUrl";
      const submitFormData = new FormData();

      // Basic form fields
      submitFormData.append("name", formData.name);
      if (formData.nameAr) submitFormData.append("nameAr", formData.nameAr);
      if (formData.description)
        submitFormData.append("description", formData.description);
      if (formData.descriptionAr)
        submitFormData.append("descriptionAr", formData.descriptionAr);

      submitFormData.append("price", String(formData.price));
      submitFormData.append("stock", String(formData.stock));
      submitFormData.append("isActive", String(formData.isActive));
      submitFormData.append("categoryId", String(formData.category));
      submitFormData.append("brandId", String(formData.brand));
      submitFormData.append("isFeatured", String(formData.isFeatured));

      if (formData.offer) {
        submitFormData.append("offer", String(formData.offer));
      }

      if (formData.offerValidFrom) {
        submitFormData.append(
          "offerValidFrom",
          String(formData.offerValidFrom)
        );
      }

      if (formData.offerValidTo) {
        submitFormData.append("offerValidTo", String(formData.offerValidTo));
      }

      // Filter out attributes with empty values
      //       if (formData.attributes && formData.attributes.length > 0) {
      //         console.log("Filtering attributes:", formData.attributes);
      // if (product?.attributes) {

      // }

      //         const validAttributes = formData.attributes.filter(
      //           (attr) =>
      //             attr &&
      //             attr.key &&
      //             attr.value !== undefined &&
      //             attr.value !== null &&
      //             attr.value !== ""
      //         );
      //         console.log("Valid attributes:", validAttributes);

      //         if (validAttributes.length > 0) {
      //           submitFormData.append("attributes", JSON.stringify(validAttributes));
      //           console.log("Sending attributes:", validAttributes);
      //         }
      //       }

      if (formData.attributes && formData.attributes.length > 0) {
        console.log("Processing attributes:", formData.attributes);

        // Track IDs of empty attributes for deletion
        const idsToDelete: number[] = [];
        const validAttributes: { key: string; value: string | number }[] = [];

        // Find existing attributes that are now empty and collect their IDs
        formData.attributes.forEach((attr, idx) => {
          // If empty value and has ID (existing attribute that changed to empty)
          if (attr?.key && attr?.value != null && attr?.value !== "")
            validAttributes.push(attr);

          if ((!attr.value || attr.value === "") && product?.attributes) {
            // if (attr?.value == null && attr?.value === "" ) {
            console.log("Found empty attribute:", attr);

            const existingAttr = product.attributes.find(
              (a) => a.key === attr.key
            );
            if (existingAttr?.id) {
              idsToDelete.push(existingAttr.id);
            }
          }
        });

        // Add ids of any empty attributes that need deletion
        if (idsToDelete.length > 0) {
          submitFormData.append(
            "deleteAttributes",
            JSON.stringify(idsToDelete)
          );
          console.log("Deleting attributes with IDs:", idsToDelete);
        }

        console.log("Valid attributes to submit:", validAttributes);

        if (validAttributes.length > 0) {
          submitFormData.append("attributes", JSON.stringify(validAttributes));
        }
      }

      // Handle images
      if (replaceAll) {
        submitFormData.append("deleteAllImages", "true");
      } else if (deletedImages.length > 0) {
        submitFormData.append(
          "deleteSpecificImages",
          JSON.stringify(deletedImages)
        );
      }

      newImages.forEach((file) => {
        submitFormData.append("images", file);
      });

      // API call
      const url = product?.id
        ? `/api/products/${product.id}?fields=${params}`
        : `/api/products?fields=${params}`;
      const method = product?.id ? "put" : "post";

      const { data } = await axios({
        method,
        url,
        data: submitFormData,
        headers: {
          Authorization: `Bearer ${token}`,
          "accept-language": lang,
        },
      });

      if (product?.id) {
        dispatch(updateProduct(data.product));
        toast.success(t("success.update"));
      } else {
        dispatch(addProduct(data.product));
        toast.success(t("success.add"));
      }
      reset(); // Reset form after submission
      setOpen(false);

      // Revalidate cache
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tag: "products",
          }),
        });
        console.log("Cache revalidated successfully");
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }
    } catch (error: any) {
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
      {/* Add/Replace All Images Controls */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => imagesInputRef.current?.click()}
          className="btn btn-outline"
        >
          {t("addImages")}
        </button>
        <input
          ref={imagesInputRef}
          type="file"
          onChange={handleAddImages}
          className="hidden"
          accept="image/*"
          multiple
        />
        <button
          type="button"
          onClick={() => replaceAllInputRef.current?.click()}
          className="btn btn-danger"
        >
          {t("replaceAllImages")}
        </button>
        <input
          ref={replaceAllInputRef}
          type="file"
          onChange={handleReplaceAllImages}
          className="hidden"
          accept="image/*"
          multiple
        />
      </div>
      <div className="relative h-72">
        <div
          onClick={handleImageClick}
          className="cursor-pointer flex justify-center items-center rounded-lg overflow-hidden bg-slate-100 h-72"
        >
          {isImageLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingIcon className="w-10 h-10 animate-spin text-teal-500" />
              <span className="text-sm text-gray-500 mt-2">{t("loading")}</span>
            </div>
          ) : images && images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto h-full w-full">
              {images.map((img, idx) => (
                <div
                  key={img + idx}
                  className="relative group w-48 h-full flex flex-col items-center justify-center"
                >
                  <ImageApi
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    height={64}
                    width={48}
                    className="w-48 object-contain rounded-3xl h-48"
                  />
                  {/* Delete button */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow group-hover:opacity-100 opacity-70 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(idx);
                    }}
                    title="Delete"
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  {/* Update/Replace button */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`replace-image-${idx}`}
                    onChange={(e) => handleReplaceImage(idx, e)}
                  />
                  <label
                    htmlFor={`replace-image-${idx}`}
                    className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1 shadow cursor-pointer group-hover:opacity-100 opacity-70 transition"
                    title="Update"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v16h16V4H4zm4 8h8"
                      />
                    </svg>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <PhotoIcon className="size-10 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">
                {t("clickToUpload")}
              </span>
            </div>
          )}
        </div>
      </div>
      <OutlineInput
        label={t("name")}
        id="product-name"
        error={errors.name?.message as string}
        {...register("name", {
          required: t("nameIsRequired"),
        })}
      />
      <OutlineInput
        label={t("nameAR")}
        id="product-nameAr"
        error={errors.nameAr?.message as string}
        {...register("nameAr")}
      />
      <div className="flex justify-between items-center gap-8">
        <OutlineInput
          label={t("price")}
          id="product-price"
          error={errors.price?.message as string}
          type="number"
          {...register("price", {
            required: t("priceIsRequired"),
            min: { value: 0, message: t("priceMin") },
          })}
          min={0}
        />
        <OutlineInput
          iconStart={<span className="text-sm">%</span>}
          label={t("offer")}
          id="product-offer"
          error={errors.offer?.message as string}
          type="number"
          {...register("offer")}
          min={0}
        />
      </div>
      <div className="flex justify-between items-center gap-8">
        <OutlineInput
          className="block"
          defaultValue={product?.offerValidFrom}
          label={t("offerValidFrom")}
          id="product-offerValidFrom"
          error={errors.offerValidFrom?.message as string}
          type="date"
          {...register("offerValidFrom", {
            required: offerValue ? t("offerValidFromRequired") : false,
          })}
        />
        <OutlineInput
          className="block"
          defaultValue={product?.offerValidTo}
          label={t("offerValidTo")}
          id="product-offerValidTo"
          error={errors.offerValidTo?.message as string}
          type="date"
          {...register("offerValidTo", {
            required: offerValue ? t("offerValidToRequired") : false,
            validate: (value) => {
              if (offerValue && validFromValue && value) {
                return (
                  new Date(value) >= new Date(validFromValue) ||
                  t("offerValidToAfterFrom")
                );
              }
            },
          })}
        />
      </div>
      <OutlineInput
        label={t("stock")}
        id="product-stock"
        error={errors.stock?.message as string}
        type="number"
        {...register("stock", {
          required: t("stockIsRequired"),
          min: { value: 0, message: t("stockMin") },
        })}
        min={0}
      />
      <OutlineTextArea
        id="product-description"
        label={t("description")}
        error={errors.description?.message as string}
        {...register("description")}
      />
      <OutlineTextArea
        id="product-descriptionAr"
        label={t("descriptionAr")}
        error={errors.descriptionAr?.message as string}
        {...register("descriptionAr")}
      />
      <FetchSelect<
        Pick<Category, "id" | "name" | "nameAr" | "productAttributes">
      >
        fieldForm={"category"}
        label={t("category")}
        fetchFunction={(params) =>
          fetchCategories({
            ...params,
            token,
            lang,
            notIn: product?.category?.id ? [product.category.id] : undefined,
            parentName: categoryName,
          })
        }
        getOptionValue={(item) => item.id}
        getOptionDisplayText={(item) =>
          lang === "ar" ? item.nameAr : item.name
        }
        getOptionLabel={(item) => (lang === "ar" ? item.nameAr : item.name)}
        placeholder={t("selectCategory")}
        className="w-full"
        errors={errors}
        roles={{ required: t("categoryIsRequired") }}
        register={register as any}
        setValue={setValue as any}
        onChange={(cat) =>
          setCategoryAttributes(cat[0]?.productAttributes ?? {})
        }
        defaultValues={
          product?.category
            ? [
                {
                  id: product?.category.id ?? 0,
                  name: product?.category.name ?? "",
                  nameAr: product?.category.nameAr ?? "",
                  productAttributes:
                    product?.category.productAttributes ?? undefined,
                },
              ]
            : []
        }
      />
      <div className="w-full">
        <FetchSelect<Pick<Brand, "id" | "name" | "nameAr" | "logoUrl">>
          fieldForm={"brand"}
          label={t("brand")}
          fetchFunction={(params) =>
            fetchBrands({
              ...params,
              token,
              lang,
              fields: "id,name,nameAr,logoUrl",
              notIn: product?.brand?.id ? [product.brand.id] : undefined,
            })
          }
          getOptionValue={(item) => item.id}
          // getOptionDisplayText={(item) =>
          //   lang === "ar" ? item.nameAr : item.name
          // }
          getOptionLabel={(item) => (lang === "ar" ? item.nameAr : item.name)}
          placeholder={t("selectBrand")}
          className="w-full"
          errors={errors}
          roles={{ required: t("brandIsRequired") }}
          register={register as any}
          setValue={setValue as any}
          defaultValues={
            product?.brand
              ? [
                  {
                    id: product?.brand.id ?? 0,
                    name: product?.brand.name ?? "",
                    nameAr: product?.brand.nameAr ?? "",
                    logoUrl: product?.brand.logoUrl ?? "",
                  },
                ]
              : []
          }
        />
      </div>

      {categoryAttributes && Object.keys(categoryAttributes).length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Attributes</h3>
          {Object.entries(categoryAttributes).map(([key, config], idx) => {
            // Find existing attribute value if editing a product
            const existingAttr = product?.attributes?.find(
              (attr) => attr.key === key
            );
            return (
              <ProductAttributeItem
                key={key}
                attributeKey={key}
                attributeConfig={config}
                index={idx}
                form={{
                  register,
                  control,
                  setValue,
                  // formState: { errors },
                }}
                errors={errors}
                productValue={existingAttr?.value}
                registerPath={`attributes.${idx}.value`}
                keyPath={`attributes.${idx}.key`}
              />
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Checkbox
              id="isActive"
              defaultChecked={product?.isActive ?? true}
              onCheckedChange={(checked) => field.onChange(checked)}
              checked={field.value}
            />
          )}
        />
        <label htmlFor="isActive" className="text-sm cursor-pointer">
          {t("isActive")}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <Checkbox
              id="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              onCheckedChange={(checked) => field.onChange(checked)}
              checked={field.value}
            />
          )}
        />
        <label htmlFor="isFeatured" className="text-sm cursor-pointer">
          {t("isFeatured")}
        </label>
      </div>
      <div className="w-full">
        <button
          disabled={loading}
          className="w-full py-2 rounded-md border-2 border-primary hover:bg-primary hover:text-white duration-200 flex justify-center"
        >
          {loading ? (
            <LoadingIcon className="size-6 animate-spin hover:stroke-white" />
          ) : (
            t("btn")
          )}
        </button>
      </div>
    </form>
  );
};

export default PopupProduct;
