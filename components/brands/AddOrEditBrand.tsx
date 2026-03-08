"use client";
import { Brand } from "@/app/[locale]/brands/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { LoadingIcon } from "../icons";
import { useTranslations, useLocale } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { OutlineInput, OutlineTextArea } from "../ui/OutlineInputs";
import { Checkbox } from "../ui/checkbox";
import AddImageInput from "../AddImageInput";
import ErrorMsg from "../ErrorMsg";
import { Button } from "../ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/appContext";
import { useSearchParams } from "next/navigation";
import { Category } from "@/app/[locale]/categories/categoriesData";
import FetchSelect from "../FetchSelect";
import fetchCategories from "@/lib/fetchCategories";

interface AddOrEditBrandProps {
  onClose: () => void;
  isOpen: boolean;
  brand?: Brand;
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  setTotalBrands: React.Dispatch<React.SetStateAction<number>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
}

interface FormData {
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  coverFile?: string;
  logoFile?: string;
  is_active: boolean;
  is_popular: boolean;
  // isDeleted: boolean;
  categories?: Pick<Category, "id" | "name" | "name_ar" | "image_url">[];
}

const AddOrEditBrand = ({
  onClose,
  isOpen,
  brand,
  setBrands,
  setTotalBrands,
  setTotalPages,
}: AddOrEditBrandProps) => {
  const t = useTranslations("brands");
  const locale = useLocale() as "en" | "ar";
  const { token } = useAppContext();
  const limit = useSearchParams().get("limit") || "10";
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brand?.logo_url || null
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    brand?.cover_url || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: brand?.name || "",
      name_ar: brand?.name_ar || undefined,
      description: brand?.description || undefined,
      description_ar: brand?.description_ar || undefined,
      coverFile: brand?.cover_url || undefined,
      logoFile: brand?.logo_url || undefined,
      is_active: brand?.is_active || true,
      is_popular: brand?.is_popular || false,
      // isDeleted: brand?.deleted_at || false,
      categories: brand?.categories?.map((cat) => cat.category) || [],
    },
  });

  const resetFormState = () => {
    reset({
      name: brand?.name || "",
      name_ar: brand?.name_ar || undefined,
      description: brand?.description || undefined,
      description_ar: brand?.description_ar || undefined,
      coverFile: undefined,
      logoFile: undefined,
      is_active: brand?.is_active ?? true,
      is_popular: brand?.is_popular ?? false,
      // isDeleted: brand?.is_deleted ?? false,
      categories: brand?.categories?.map((cat) => cat.category) || [],
    });

    setLogoPreview(brand?.logo_url || null);
    setCoverPreview(brand?.cover_url || null);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const { logoFile, coverFile, ...rest } = formData;

      const fData: Omit<
        Brand,
        "id" | "created_at" | "updated_at" | "slug" | "categories" | "sort_id"
      > = {
        ...rest,
      };
      if (logoFile?.[0]) fData.logo_url = logoFile[0];
      if (coverFile?.[0]) fData.cover_url = coverFile[0];

      const fields =
        "id,name,slug,name_ar,description,description_ar,logo_url,cover_url,is_active,is_popular,products=id-name-name_ar-images,created_at,categories=id-category=id-name-name_ar-icon_url";

      const { data } = await axios({
        method: brand ? "PUT" : "POST",
        url: brand
          ? `/api/brands/${brand.id}?fields=${fields}`
          : `/api/brands?fields=${fields}`,
        data: {
          ...fData,
          categories: rest.categories
            ? `[${rest.categories.toString()}]`
            : undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          "accept-language": locale,
        },
      });
      toast.success(brand ? t("successUpdate") : t("successAdd"));
      if (brand) {
        setBrands((prev) =>
          prev.map((b) => (b.id === data.brand.id ? data.brand : b))
        );
      } else {
        let totalBrands = 0;
        setBrands((prev) => [data.brand, ...prev]);
        setTotalBrands((prev) => {
          totalBrands = prev + 1;
          return totalBrands;
        });
        setTotalPages(() => Math.ceil(totalBrands / Number(limit)));
      }

      onClose();
      reset();
      setLogoPreview(null);
      setCoverPreview(null);

      // Revalidate cache
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tag: "brands",
          }),
        });
        console.log("Cache revalidated successfully");
      } catch (revalidateError) {
        console.error("Failed to revalidate cache:", revalidateError);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };
  useEffect(() => {
    if (isOpen) {
      // When dialog opens → hydrate form
      resetFormState();
    } else {
      // When dialog closes → clean everything
      reset();
      setLogoPreview(null);
      setCoverPreview(null);
    }
  }, [isOpen, brand]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-4/5">
        <DialogHeader>
          <DialogTitle>{brand ? t("editBrand") : t("addBrand")}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {/* Form content goes here */}
        <form
          className="h-full flex flex-col gap-4 overflow-hidden"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 px-3 py-1.5 h-[95%] overflow-y-auto">
            <div className="h-28">
              <AddImageInput
                key={"logoFile"}
                fieldForm="logoFile"
                register={register}
                imagePreview={logoPreview}
                setImagePreview={setLogoPreview}
                text={t("logoUrlDescription")}
              />
              <ErrorMsg message={errors?.logoFile?.message as string} />
            </div>
            <div className="h-28">
              <AddImageInput
                key={"coverFile"}
                fieldForm="coverFile"
                register={register}
                imagePreview={coverPreview}
                setImagePreview={setCoverPreview}
                text={t("coverUrlDescription")}
              />
              <ErrorMsg message={errors?.coverFile?.message as string} />
            </div>
            <OutlineInput
              {...register("name", {
                required: t("nameRequired"),
                value: brand?.name,
              })}
              label={t("name")}
              id="brand-name"
              error={errors?.name?.message as string}
            />
            <OutlineInput
              id="brand-name-ar"
              {...register("name_ar")}
              label={t("nameAr")}
              error={errors?.name_ar?.message as string}
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
              error={errors.description_ar?.message as string}
              {...register("description_ar")}
              rows={6}
            />
            <div className="col-span-2">
              <FetchSelect<Pick<Category, "id" | "name" | "name_ar" | "icon_url">>
                fieldForm={"categories"}
                multiple
                label={t("category")}
                fetchFunction={(params) =>
                  fetchCategories({
                    ...params,
                    token,
                    lang: locale,
                    notIn:
                      brand?.categories?.map(({ category }) => category.id) ||
                      [],
                  })
                }
                getOptionValue={(item) => item.id}
                getOptionDisplayText={(item) =>
                  locale === "ar" ? item.name_ar : item.name
                }
                getOptionLabel={(item) =>
                  locale === "ar" ? item.name_ar : item.name
                }
                placeholder={t("selectCategories")}
                // className="w-full"
                errors={errors}
                roles={{ required: t("categoryIsRequired") }}
                register={register as any}
                setValue={setValue as any}
                defaultValues={
                  brand?.categories
                    ? brand.categories.map((cat) => {
                        return {
                          id: cat.category.id ?? 0,
                          name: cat.category.name ?? "",
                          name_ar: cat.category.name_ar ?? "",
                          icon_url: cat.category.icon_url ?? "",
                        };
                      })
                    : []
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Checkbox
                    id="brand-isActive"
                    defaultChecked={brand?.is_active ?? true}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    checked={field.value}
                  />
                )}
              />
              <label
                htmlFor="brand-isActive"
                className="text-sm cursor-pointer"
              >
                {t("isActive")}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="is_popular"
                render={({ field }) => (
                  <Checkbox
                    id="brand-isPopular"
                    defaultChecked={brand?.is_popular ?? false}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    checked={field.value}
                  />
                )}
              />
              <label
                htmlFor="brand-isPopular"
                className="text-sm cursor-pointer"
              >
                {t("isPopular")}
              </label>
            </div>

            {/* <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="isDeleted"
                render={({ field }) => (
                  <Checkbox
                    id="brand-isDeleted"
                    defaultChecked={brand?.isDeleted ?? false}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    checked={field.value}
                  />
                )}
              />
              <label
                htmlFor="brand-isDeleted"
                className="text-sm cursor-pointer"
              >
                {t("isDeleted")}
              </label>
            </div> */}
          </div>
          <div className="px-3 py-1.5 border-t">
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting && (
                <LoadingIcon className="size-6 animate-spin hover:stroke-white" />
              )}
              {!isSubmitting && (brand ? t("saveChanges") : t("addBrand"))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrEditBrand;
