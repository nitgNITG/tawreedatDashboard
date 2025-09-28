import React, { useState } from "react";
import ErrorMsg from "../ErrorMsg";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { LoadingIcon } from "../icons";
import axios from "axios";
import { useAppDispatch } from "@/hooks/redux";
import { addFaqs, updateFaqs } from "@/redux/reducers/faqsReducer";
import { useAppContext } from "@/context/appContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const AddFAQs = ({
  setOpen,
  faqs,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  faqs?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const t = useTranslations("faqs.form");
  const dispatch = useAppDispatch();
  const { token } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setOpen(false);
  };


  const onSubmit = handleSubmit(async (fData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `/api/faqs`,
        {
          question: fData.que,
          answer: fData.ans,
          language: locale.toUpperCase(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(addFaqs(data.faq));
      toast.success(t("success"));
      setLoading(false);
      handleClose();
    } catch (error: any) {
      setLoading(false);
      setError(error?.response?.data?.error);
      console.error(error);
      
      console.error("Submit Error:", error?.response?.data?.error);
      toast.error(error?.response?.data?.message);
    }
  });

  const handleUpdateImage = handleSubmit(async (fData) => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `/api/faqs/${faqs.id}`,
        {
          question: fData.que,
          answer: fData.ans,
          language: locale.toUpperCase(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(updateFaqs(data.faq));
      toast.success(t("successUpdate"));
      setLoading(false);
      handleClose();
    } catch (error: any) {
      setLoading(false);
      setError(error?.response?.data?.error);
      console.error("Submit Error:", error?.response?.data?.error);
      toast.error(error?.response?.data?.message);
    }
  });

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{faqs ? t("updateBtn") : t("btn")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={faqs ? handleUpdateImage : onSubmit}>
          <div className="space-y-5">
            <div>
              <input
                {...register("que", {
                  required: t("que.error"),
                  value: faqs?.que,
                })}
                type="text"
                className="border py-3 px-2 w-full rounded-md outline-none"
                placeholder={t("que.placeholder")}
              />
              <ErrorMsg message={errors?.que?.message as string} />
            </div>
            <div>
              <textarea
                {...register("ans", {
                  required: t("ans.error"),
                  value: faqs?.ans,
                })}
                className="border py-3 px-2 w-full rounded-md outline-none resize-none h-32"
                placeholder={t("ans.placeholder")}
              />
              <ErrorMsg message={errors?.ans?.message as string} />
            </div>
            <div className="w-full">
              <button
                disabled={loading}
                className="w-full py-2 rounded-md border-2 border-primary hover:bg-primary hover:text-white duration-200 flex justify-center"
              >
                {loading ? (
                  <LoadingIcon className="w-6 h-6 animate-spin hover:stroke-white" />
                ) : faqs ? (
                  t("updateBtn")
                ) : (
                  t("btn")
                )}
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFAQs;
