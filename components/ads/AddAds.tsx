import { useAppContext } from "@/context/appContext";
import { useAppDispatch } from "@/hooks/redux";
import { Ad, addAds, AdsType, updateAds } from "@/redux/reducers/adsReducer";
import axios from "axios";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AddImageInput from "../AddImageInput";
import CustomDatePicker from "../CustomDatePicker";
import ErrorMsg from "../ErrorMsg";
import { LoadingIcon } from "../icons";
import CustomSelect from "../users/CustomSelect";
import UserInput from "../users/UserInput";
import PrioritySelect from "./PrioritySelect";

const AddAds = ({ handleClose, ad }: { handleClose: () => void; ad?: Ad }) => {
  const t = useTranslations("ads");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
  } = useForm();

  useEffect(() => {
    reset({
      title: ad?.title ?? "",
      titleAr: ad?.titleAr ?? "",
      description: ad?.description ?? "",
      descriptionAr: ad?.descriptionAr ?? "",
      status: ad?.status ?? "Active",
      startDate: ad?.startDate
        ? new Date(ad.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: ad?.endDate
        ? new Date(ad.endDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      targetUrl: ad?.targetUrl ?? "",
      adType: ad?.adType ?? AdsType.Home,
      displayDuration: ad?.displayDuration ?? 24,
      priority: ad?.priority?.toString() ?? "",
      imageFile: undefined,
    });
    setImage(ad?.imageUrl ?? null);
  }, [ad, reset]);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(ad?.imageUrl ?? null);
  const { token } = useAppContext();
  const dispatch = useAppDispatch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      let adData = { ...formData };
      if (formData.startDate > formData.endDate) {
        setError("startDate", {
          message: t("startDateShouldBeLessThanEndDate"),
        });
        setError("endDate", {
          message: t("endDateShouldBeGreaterThanStartDate"),
        });
        setLoading(false);
        return;
      }

      if (Array.isArray(formData.userTypes))
        adData.userTypes = formData.userTypes.join(",");

      if (formData.imageFile) adData.imageUrl = formData.imageFile[0];
      delete adData.imageFile;

      const method = ad ? "put" : "post";
      const url = ad ? `/api/ads/${ad.id}` : "/api/ads";

      const { data } = await axios[method](url, adData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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
            roles={{ value: ad?.titleAr, required: t("titleRequired") }}
            fieldForm="titleAr"
            register={register}
            label={t("titleAr")}
            defaultValue={ad?.titleAr}
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
              defaultValue={ad?.descriptionAr}
              {...register("descriptionAr", {
                value: ad?.descriptionAr,
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
              ad?.startDate
                ? new Date(ad.startDate).toISOString().split("T")[0]
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
              ad?.endDate
                ? new Date(ad.endDate).toISOString().split("T")[0]
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
            roles={{ value: ad?.targetUrl, required: t("targetUrlRequired") }}
            defaultValue={ad?.targetUrl}
            errors={errors}
            label={t("targetUrl")}
          />
          <CustomSelect
            errors={errors}
            fieldForm="adType"
            label={t("adType")}
            register={register}
            placeholder={t("selectAdType")}
            roles={{ value: ad?.adType, required: t("adTypeRequired") }}
            defaultValue={ad?.adType ?? AdsType.Home}
            options={Object.values(AdsType).map((type) => ({
              value: type,
              label: t(type),
            }))}
          />
          <UserInput
            fieldForm="displayDuration"
            register={register}
            roles={{
              value: ad?.displayDuration ?? 24,
              required: t("displayDurationRequired"),
            }}
            defaultValue={ad?.displayDuration}
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
