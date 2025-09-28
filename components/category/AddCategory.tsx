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
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${category.id}?fields=${fields}`,
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
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories?fields=${fields}`,
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

      // Revalidate cache
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
          <div className="relative h-72">
            <div
              onClick={handleImageClick}
              className="cursor-pointer flex justify-center items-center rounded-lg overflow-hidden bg-slate-100"
            >
              {isImageLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <LoadingIcon className="size-10 animate-spin text-teal-500" />
                  <span className="text-sm text-gray-500 mt-2">
                    {t("loading")}
                  </span>
                </div>
              ) : previewImage ? (
                <div className="relative group h-72 flex justify-center items-center">
                  <ImageApi
                    src={previewImage}
                    alt="Category"
                    height={64}
                    width={48}
                    className="w-48 object-contain rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg">
                    <PhotoIcon className="size-10 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
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
          <div className="relative h-72">
            <div
              onClick={handleIconClick}
              className="cursor-pointer flex justify-center items-center rounded-lg overflow-hidden bg-slate-100"
            >
              {isIconLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <LoadingIcon className="size-10 animate-spin text-teal-500" />
                  <span className="text-sm text-gray-500 mt-2">
                    {t("loading")}
                  </span>
                </div>
              ) : previewIcon ? (
                <div className="relative group h-72 flex justify-center items-center">
                  <ImageApi
                    src={previewIcon}
                    alt="Category Icon"
                    height={48}
                    width={48}
                    className="w-32 object-contain rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-lg">
                    <PhotoIcon className="size-10 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
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
        <h3 className="text-lg font-semibold mb-4">product_attributes</h3>
        <Controller
          control={control}
          name="productAttributes"
          render={({ field }) => {
            const attributes = field.value || {};
            const [attributeKeys, setAttributeKeys] = useState(
              Object.keys(attributes)
            );
            const [newAttributeKey, setNewAttributeKey] = useState("");
            const [selectedColors, setSelectedColors] = useState<Set<string>>(
              new Set()
            );
            const [selectedCountries, setSelectedCountries] = useState<
              Set<string>
            >(new Set());

            // Initialize the selected values from existing attributes
            useEffect(() => {
              if (attributes?.["color"]?.enum) {
                setSelectedColors(
                  new Set(
                    (attributes["color"].enum || []).map((v: string | number) =>
                      String(v)
                    )
                  )
                );
              }

              if (attributes?.["country"]?.enum) {
                setSelectedCountries(
                  new Set(
                    (attributes["country"].enum || []).map(
                      (v: string | number) => String(v)
                    )
                  )
                );
              }
            }, []);

            // Add a new attribute with special handling for color and country
            const addAttribute = () => {
              if (!newAttributeKey.trim()) return;
              if (attributeKeys.includes(newAttributeKey)) {
                toast.error(t("attribute_already_exists"));
                return;
              }

              const newAttributes = {
                ...attributes,
                [newAttributeKey]: { type: "string", required: false },
              };

              field.onChange(newAttributes);
              setAttributeKeys([...attributeKeys, newAttributeKey]);
              if (newAttributeKey.toLowerCase() === "color") {
                setSelectedColors(new Set());
              } else if (newAttributeKey.toLowerCase() === "country") {
                setSelectedCountries(new Set());
              }
              setNewAttributeKey("");
            };

            // Remove an attribute
            const removeAttribute = (key: string) => {
              const { [key]: _, ...rest } = attributes;
              field.onChange(rest);
              setAttributeKeys(attributeKeys.filter((k) => k !== key));
              if (key.toLowerCase() === "color") {
                setSelectedColors(new Set());
              } else if (key.toLowerCase() === "country") {
                setSelectedCountries(new Set());
              }
            };

            // Update an attribute property
            const updateAttribute = (
              key: string,
              property: string,
              value: any
            ) => {
              const updatedAttr = {
                ...attributes[key],
                [property]: value,
              };

              field.onChange({
                ...attributes,
                [key]: updatedAttr,
              });
            };

            // Add enum value
            const addEnumValue = (key: string, value: string) => {
              if (!value.trim()) return;

              const currentEnum: string[] =
                (attributes[key].enum as string[]) || [];
              if (currentEnum.includes(value)) {
                toast.error(t("enum_value_already_exists"));
                return;
              }

              updateAttribute(key, "enum", [...currentEnum, value]);
            };

            // Add multiple enum values (for colors/countries)
            const addMultipleEnumValues = (
              key: string,
              values: { id: number; name: string }[]
            ) => {
              const names = values.map((item) => item.name);
              if (!names.length) return;

              const currentEnum: string[] =
                (attributes[key].enum as string[]) || [];
              const newValues = names.filter(
                (name) => !currentEnum.includes(name)
              );

              if (newValues.length) {
                if (key.toLowerCase() === "color") {
                  const updatedSet = new Set(Array.from(selectedColors));
                  names.forEach((name) => updatedSet.add(name));
                  setSelectedColors(updatedSet);
                } else if (key.toLowerCase() === "country") {
                  const updatedSet = new Set(Array.from(selectedCountries));
                  names.forEach((name) => updatedSet.add(name));
                  setSelectedCountries(updatedSet);
                }
                updateAttribute(key, "enum", [...currentEnum, ...newValues]);
              }
            };

            // Remove enum value
            const removeEnumValue = (key: string, value: string) => {
              const currentEnum = attributes[key].enum || [];

              if (key.toLowerCase() === "color") {
                const updatedSet = new Set(Array.from(selectedColors));
                updatedSet.delete(value);
                setSelectedColors(updatedSet);
              } else if (key.toLowerCase() === "country") {
                const updatedSet = new Set(Array.from(selectedCountries));
                updatedSet.delete(value);
                setSelectedCountries(updatedSet);
              }
              updateAttribute(
                key,
                "enum",
                currentEnum.filter((v) => v !== value)
              );
            };

            return (
              <>
                <div className="mb-4 flex gap-2">
                  <OutlineInput
                    id="new-attribute-name"
                    label="new_attribute_name"
                    value={newAttributeKey}
                    onChange={(e) => setNewAttributeKey(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="self-end h-10 px-4 text-xxs bg-primary text-white rounded-md hover:bg-primary/80"
                  >
                    add attribute
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {attributeKeys.map((key) => (
                    <div key={key} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-lg">{key}</h4>
                        <button
                          type="button"
                          onClick={() => removeAttribute(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Type selector */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            type
                          </label>
                          <select
                            value={attributes[key].type}
                            onChange={(e) =>
                              updateAttribute(key, "type", e.target.value)
                            }
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="string">string</option>
                            <option value="number">number</option>
                            <option value="boolean">boolean</option>
                          </select>
                        </div>

                        {/* Required checkbox */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`required-${key}`}
                            checked={!!attributes[key].required}
                            onCheckedChange={(checked) =>
                              updateAttribute(key, "required", !!checked)
                            }
                          />
                          <label
                            htmlFor={`required-${key}`}
                            className="text-sm"
                          >
                            required
                          </label>
                        </div>

                        {/* Default value */}
                        <div>
                          {attributes[key].type === "boolean" ? (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`default-${key}`}
                                checked={!!attributes[key].default}
                                onCheckedChange={(checked) =>
                                  updateAttribute(key, "default", !!checked)
                                }
                              />
                              <label
                                htmlFor={`default-${key}`}
                                className="text-sm"
                              >
                                true
                              </label>
                            </div>
                          ) : (
                            <OutlineInput
                              id={`default-input-${key}`}
                              label="default_value"
                              value={
                                typeof attributes[key].default === "boolean"
                                  ? attributes[key].default
                                    ? "true"
                                    : "false"
                                  : attributes[key].default || ""
                              }
                              onChange={(e) =>
                                updateAttribute(
                                  key,
                                  "default",
                                  attributes[key].type === "number"
                                    ? parseFloat(e.target.value) || 0
                                    : e.target.value
                                )
                              }
                            />
                          )}
                        </div>

                        {/* Enum values (for string and number types) */}
                        {attributes[key].type !== "boolean" && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              allowed_values
                            </label>

                            <div className="flex flex-wrap gap-2 mb-2">
                              {(attributes[key].enum || []).map((value, i) => (
                                <div
                                  key={i}
                                  className="flex items-center bg-gray-100 px-2 py-1 rounded-md"
                                >
                                  <span>{value}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeEnumValue(key, String(value))
                                    }
                                    className="ml-1 text-red-500 hover:text-red-700"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Special handling for color/country */}
                            {key.toLowerCase() === "color" ? (
                              <div className="mb-3">
                                <FetchSelect<Colors>
                                  // key={`fetch-colors-${Array.from(selectedColors).join(",")}`}
                                  label="Select colors to add"
                                  fetchFunction={(params) =>
                                    fetchColors({
                                      ...params,
                                      token,
                                      lang,
                                      notIn: selectedColors
                                        ? Array.from(selectedColors)
                                        : undefined,
                                    })
                                  }
                                  getOptionValue={(item) => item.id}
                                  getOptionDisplayText={(item) => item.name}
                                  getOptionLabel={(item) => item.name}
                                  className="w-full"
                                  multiple
                                  onChange={(selectedColors) => {
                                    addMultipleEnumValues(key, selectedColors);
                                  }}
                                />
                              </div>
                            ) : key.toLowerCase() === "country" ? (
                              <div className="mb-3">
                                <FetchSelect<Countries>
                                  // key={`fetch-countries-${Array.from(selectedCountries).join(",")}`}
                                  label="Select countries to add"
                                  fetchFunction={(params) =>
                                    fetchCountries({
                                      ...params,
                                      token,
                                      lang,
                                      notIn: selectedCountries
                                        ? Array.from(selectedCountries)
                                        : undefined,
                                    })
                                  }
                                  getOptionValue={(item) => item.id}
                                  getOptionDisplayText={(item) => item.name}
                                  getOptionLabel={(item) => item.name}
                                  className="w-full"
                                  multiple
                                  onChange={(selectedCountries) => {
                                    addMultipleEnumValues(
                                      key,
                                      selectedCountries
                                    );
                                  }}
                                />
                              </div>
                            ) : (
                              // Regular input for other attribute types
                              <div className="flex gap-2 justify-center items-center">
                                <OutlineInput
                                  label="add_value"
                                  className="flex-1"
                                  id={`enum-input-${key}`}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addEnumValue(key, e.currentTarget.value);
                                      e.currentTarget.value = "";
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      `enum-input-${key}`
                                    ) as HTMLInputElement;
                                    addEnumValue(key, input.value);
                                    input.value = "";
                                  }}
                                  className="h-10 px-3 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {attributeKeys.length === 0 && (
                  <p className="text-gray-500 italic">no_attributes</p>
                )}
              </>
            );
          }}
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
