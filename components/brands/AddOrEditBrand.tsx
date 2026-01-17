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
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  coverFile?: string;
  logoFile?: string;
  isActive: boolean;
  isPopular: boolean;
  isDeleted: boolean;
  categories?: Pick<Category, "id" | "name" | "nameAr" | "iconUrl">[];
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
    brand?.logoUrl || null
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(
    brand?.coverUrl || null
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
      nameAr: brand?.nameAr || undefined,
      description: brand?.description || undefined,
      descriptionAr: brand?.descriptionAr || undefined,
      coverFile: brand?.coverUrl || undefined,
      logoFile: brand?.logoUrl || undefined,
      isActive: brand?.isActive || true,
      isPopular: brand?.isPopular || false,
      isDeleted: brand?.isDeleted || false,
      categories: brand?.categories?.map((cat) => cat.category) || [],
    },
  });

  const resetFormState = () => {
    reset({
      name: brand?.name || "",
      nameAr: brand?.nameAr || undefined,
      description: brand?.description || undefined,
      descriptionAr: brand?.descriptionAr || undefined,
      coverFile: undefined,
      logoFile: undefined,
      isActive: brand?.isActive ?? true,
      isPopular: brand?.isPopular ?? false,
      isDeleted: brand?.isDeleted ?? false,
      categories: brand?.categories?.map((cat) => cat.category) || [],
    });

    setLogoPreview(brand?.logoUrl || null);
    setCoverPreview(brand?.coverUrl || null);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const { logoFile, coverFile, ...rest } = formData;

      const fData: Omit<
        Brand,
        "id" | "createdAt" | "updatedAt" | "slug" | "categories" | "sortId"
      > = {
        ...rest,
      };
      if (logoFile?.[0]) fData.logoUrl = logoFile[0];
      if (coverFile?.[0]) fData.coverUrl = coverFile[0];

      const fields =
        "id,name,slug,nameAr,description,descriptionAr,logoUrl,coverUrl,isActive,isDeleted,isPopular,products=id-name-nameAr-images,createdAt,categories=id-category=id-name-nameAr-iconUrl";

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
              {...register("nameAr")}
              label={t("nameAr")}
              error={errors?.nameAr?.message as string}
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
            <div className="col-span-2">
              <FetchSelect<Pick<Category, "id" | "name" | "nameAr" | "iconUrl">>
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
                  locale === "ar" ? item.nameAr : item.name
                }
                getOptionLabel={(item) =>
                  locale === "ar" ? item.nameAr : item.name
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
                          nameAr: cat.category.nameAr ?? "",
                          iconUrl: cat.category.iconUrl ?? "",
                        };
                      })
                    : []
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Checkbox
                    id="brand-isActive"
                    defaultChecked={brand?.isActive ?? true}
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
                name="isPopular"
                render={({ field }) => (
                  <Checkbox
                    id="brand-isPopular"
                    defaultChecked={brand?.isPopular ?? false}
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

            <div className="flex items-center gap-2">
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
            </div>
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
