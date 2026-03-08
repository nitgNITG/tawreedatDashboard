"use client";
import { useAppContext } from "@/context/appContext";
import { useAppDispatch } from "@/hooks/redux";
import { Ad, addAds, AdsType, updateAds } from "@/redux/reducers/adsReducer";
import axios from "axios";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AddImageInput from "../AddImageInput";
import CustomDatePicker from "../CustomDatePicker";
import ErrorMsg from "../ErrorMsg";
import { LoadingIcon } from "../icons";
import CustomSelect from "../users/CustomSelect";
import UserInput from "../users/UserInput";
import PrioritySelect from "./PrioritySelect";
import { fetchBrands } from "@/lib/fetchBrands";
import FetchSelect from "../FetchSelect";
import { Brand } from "@/app/[locale]/brands/page";
import { Switch } from "../ui/switch";
import { X } from "lucide-react";
import { Button } from "../ui/button";

const AddAds = ({ handleClose, ad }: { handleClose: () => void; ad?: Ad }) => {
  const t = useTranslations("ads");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
    setValue,
  } = useForm();

  useEffect(() => {
    reset({
      title: ad?.title ?? "",
      title_ar: ad?.title_ar ?? "",
      description: ad?.description ?? "",
      description_ar: ad?.description_ar ?? "",
      status: ad?.status ?? "Active",
      start_date: ad?.start_date
        ? new Date(ad.start_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      end_date: ad?.end_date
        ? new Date(ad.end_date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      target_url: ad?.target_url ?? undefined,
      mobile_screen: ad?.mobile_screen ?? undefined,
      adType: ad?.ad_type ?? AdsType.INTERNAL,
      duration_seconds: ad?.duration_seconds ?? 24,
      priority: ad?.priority?.toString() ?? "",
      imageFile: undefined,
      closable: ad ? ad?.closable : true,
    });
    setImage(ad?.image_url ?? null);
  }, [ad, reset]);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(ad?.image_url ?? null);
  const { token } = useAppContext();
  const dispatch = useAppDispatch();
  const lang = useLocale() as "en" | "ar";

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      let adData = { ...formData };
      if (formData.startDate > formData.endDate) {
        setError("start_date", {
          message: t("startDateShouldBeLessThanEndDate"),
        });
        setError("end_date", {
          message: t("endDateShouldBeGreaterThanStartDate"),
        });
        setLoading(false);
        return;
      }

      if (Array.isArray(formData.userTypes))
        adData.userTypes = formData.userTypes.join(",");

      if (formData.imageFile) adData.image_url = formData.imageFile[0];
      delete adData.imageFile;

      const method = ad ? "put" : "post";
      const url = ad ? `/api/ads/${ad.id}` : "/api/ads";

      const { data } = await axios[method](url, adData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
          "Accept-Language": lang,
        },
      });
      toast.success(ad ? t("successUpdate") : t("success"));

      if (ad) {
        dispatch(updateAds(data.ad));
      } else {
        dispatch(addAds(data.ad));
      }
      reset();
      handleClose();
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      toast.error(err?.response?.data?.message ?? "There is an Error");
    } finally {
      URL.revokeObjectURL(image ?? "");
      setLoading(false);
    }
  });

  return (
    <div className="rounded-xl w-[calc(100vw-42px)]  md:w-full border p-6 ">
      <h3 className="text-2xl font-bold mb-6">{t("adInfo")}</h3>
      <form className="grid grid-cols-2 gap-x-14" onSubmit={onSubmit}>
        <div className="flex flex-col gap-3">
          <UserInput
            errors={errors}
            roles={{ value: ad?.title, required: t("titleRequired") }}
            fieldForm="title"
            register={register}
            label={t("title")}
            defaultValue={ad?.title}
          />
          <UserInput
            errors={errors}
            roles={{ value: ad?.title_ar, required: t("titleRequired") }}
            fieldForm="titleAr"
            register={register}
            label={t("titleAr")}
            defaultValue={ad?.title_ar}
          />

          <div className="grid items-center grid-cols-1 h-min gap-y-2">
            <label className="text-nowrap" htmlFor="description">
              {t("description")}:
            </label>
            <textarea
              defaultValue={ad?.description}
              {...register("description", {
                value: ad?.description,
              })}
              id="description"
              className={clsx(
                "border-2 border-[#DADADA] p-2 rounded-xl bg-transparent shadow-[0px_0px_5px_-1px_#00000040] outline-none",
                "hover:border-primary focus:border-primary",
                "transition-colors duration-200 ease-in-out"
              )}
            ></textarea>
            <ErrorMsg message={errors?.description?.message as string} />
          </div>
          <div className="grid items-center grid-cols-1 h-min gap-y-2">
            <label className="text-nowrap" htmlFor="descriptionAr">
              {t("descriptionAr")}:
            </label>
            <textarea
              defaultValue={ad?.description_ar}
              {...register("descriptionAr", {
                value: ad?.description_ar,
              })}
              id="descriptionAr"
              className={clsx(
                "border-2 border-[#DADADA] p-2 rounded-xl bg-transparent shadow-[0px_0px_5px_-1px_#00000040] outline-none",
                "hover:border-primary focus:border-primary",
                "transition-colors duration-200 ease-in-out"
              )}
            ></textarea>
            <ErrorMsg message={errors?.descriptionAr?.message as string} />
          </div>

          <CustomSelect
            roles={{ value: ad?.status, required: t("statusRequired") }}
            errors={errors}
            fieldForm="status"
            label={t("status")}
            placeholder={t("selectStatus")}
            register={register}
            defaultValue={ad?.status ?? "Active"}
            options={[
              { value: "Active", label: t("active") },
              { value: "Inactive", label: t("blocked") },
            ]}
          />

          <CustomDatePicker
            errors={errors}
            fieldForm="startDate"
            label={t("startDate")}
            defaultValue={
              ad?.start_date
                ? new Date(ad.start_date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
            }
            control={control}
            rules={{ required: t("startDateRequired") }}
          />
          <CustomDatePicker
            errors={errors}
            fieldForm="endDate"
            label={t("endDate")}
            defaultValue={
              ad?.end_date
                ? new Date(ad.end_date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
            }
            control={control}
            rules={{ required: t("endDateRequired") }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-full h-32">
            <AddImageInput
              fieldForm="imageFile"
              register={register}
              text={t("addImage")}
              imagePreview={image}
              setImagePreview={setImage}
              required={ad ? false : t("imageRequired")}
            />
            <ErrorMsg message={errors?.["imageFile"]?.message as string} />
          </div>
          <UserInput
            fieldForm="targetUrl"
            register={register}
            roles={{ value: ad?.target_url || undefined, required: false }}
            defaultValue={ad?.target_url || undefined}
            errors={errors}
            label={t("targetUrl")}
          />
          <div className="grid items-center grid-cols-1 h-min gap-y-2">
            <label className="text-nowrap" htmlFor="mobileScreen">
              {t("mobileScreen")}:
            </label>
            <div className="relative">
              <textarea
                defaultValue={ad?.mobile_screen}
                readOnly
                rows={5}
                {...register("mobileScreen", {
                  value: ad?.mobile_screen,
                })}
                id="mobileScreen"
                className={clsx(
                  "border-2 border-[#DADADA] p-2 rounded-xl bg-transparent shadow-[0px_0px_5px_-1px_#00000040] outline-none",
                  "hover:border-primary focus:border-primary",
                  "transition-colors duration-200 ease-in-out w-full"
                )}
              ></textarea>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setValue("mobileScreen", "")}
                className="absolute top-2 end-4 text-gray-500 p-1 h-auto"
              >
                <X className="size-4" />
              </Button>
            </div>
            <ErrorMsg message={errors?.mobileScreen?.message as string} />
          </div>
          <div className="w-full">
            <FetchSelect<
              Pick<
                Brand,
                | "id"
                | "name"
                | "name_ar"
                | "logo_url"
                | "cover_url"
                | "description"
                | "description_ar"
              >
            >
              fieldForm={"brand"}
              label={t("brand")}
              fetchFunction={(params) =>
                fetchBrands({
                  ...params,
                  token,
                  lang,
                  fields:
                    "id,name,nameAr,logoUrl,coverUrl,description,descriptionAr",
                })
              }
              getOptionValue={(item) => item.id}
              // getOptionDisplayText={(item) =>
              //   lang === "ar" ? item.nameAr : item.name
              // }
              getOptionLabel={(item) =>
                lang === "ar" ? item.name_ar : item.name
              }
              placeholder={t("selectBrand")}
              className="w-full"
              onChange={(value) => {
                if (value.length > 0) {
                  const brand = value[0];
                  setValue(
                    "mobileScreen",
                    `tawreedat://products?id=${
                      brand.id || null
                    }&isBrand=true&name=${brand.name || null}&nameAr=${
                      brand.name_ar || null
                    }&imageUrl=${brand.cover_url || null}&iconUrl=${
                      brand.logo_url || null
                    }&description=${brand.description || null}&descriptionAr=${
                      brand.description_ar || null
                    }`
                  );
                }
              }}
            />
          </div>

          <CustomSelect
            errors={errors}
            fieldForm="adType"
            label={t("adType")}
            register={register}
            placeholder={t("selectAdType")}
            roles={{ value: ad?.ad_type, required: t("adTypeRequired") }}
            defaultValue={ad?.ad_type ?? AdsType.INTERNAL}
            options={Object.values(AdsType).map((type) => ({
              value: type,
              label: t(type),
            }))}
          />
          <UserInput
            fieldForm="displayDuration"
            register={register}
            roles={{
              value: ad?.duration_seconds ?? 24,
              required: t("displayDurationRequired"),
            }}
            defaultValue={ad?.duration_seconds}
            errors={errors}
            type="number"
            min={1}
            max={60}
            icon={<span className="text-sm">{t("second")}</span>}
            label={t("displayDuration")}
          />
          <PrioritySelect
            key={ad?.id}
            register={register}
            errors={errors}
            currentAd={ad}
          />
          <Controller
            control={control}
            name="closable"
            defaultValue={true}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <label htmlFor="closable">{t("closable")}</label>
                <Switch
                  id="closable"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </div>
            )}
          />
          <div className="grid grid-cols-2 gap-10">
            <button
              disabled={loading}
              className="py-2 px-12 rounded-3xl bg-primary text-white flex justify-center"
            >
              {loading && (
                <LoadingIcon className="size-6 animate-spin hover:stroke-white" />
              )}
              {!loading && (ad ? t("edit") : t("add"))}
            </button>
            <button
              className="py-2 px-12 rounded-3xl border border-[#E9E9E9]"
              type="reset"
              onClick={() => {
                reset();
                handleClose();
              }}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddAds;
