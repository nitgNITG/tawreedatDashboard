import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/hooks/redux";
import { Contact } from "@/types/contact";
import { useState, useEffect } from "react";
import { LoadingIcon } from "../icons";
import { updateContact } from "@/redux/reducers/contactsReducer";

const UpdateContactPopup = ({
  contact,
  setContact,
  openForm,
  setOpenForm,
}: {
  contact: Contact | null;
  setContact: (contact: Contact | null) => void;
  openForm: boolean;
  setOpenForm: (open: boolean) => void;
}) => {
  const { token } = useAppContext();
  const t = useTranslations("contact");
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      response: "",
      email: contact?.email ?? "",
      message: contact?.message ?? "",
    },
  });

  useEffect(() => {
    if (contact) {
      reset({
        response: contact.response ?? "",
        email: contact.email ?? "",
        message: contact.message ?? "",
      });
    }
  }, [contact, reset]);

  const handleUpdateContact = handleSubmit(async (formData) => {
    if (!contact) return;
    try {
      setLoading(true);
      const { data } = await axios.put(
        `/api/contact-us/${contact.id}?lang=${locale}`,
        { response: formData.response },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(updateContact(data.contact));
      toast.success(t("successUpdate"));
      handleClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "There is an Error");
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    reset();
    setContact(null);
    setOpenForm(false);
  };

  return (
    <Dialog open={openForm} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("updateContact")}</DialogTitle>
          <DialogDescription>{t("updateMessage")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateContact} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("email")}
            </label>
            <input
              value={contact?.email ?? ""}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("message")}
            </label>
            <textarea
              value={contact?.message ?? ""}
              readOnly
              className="w-full p-2 border font-bold rounded-md bg-gray-50"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("response")}
            </label>
            <textarea
              {...register("response", { required: t("responseRequired") })}
              className="w-full p-2 border rounded-md"
              rows={4}
            />
            {errors.response && (
              <span className="text-red-500 text-sm">
                {errors.response.message as string}
              </span>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 rounded-md border"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded-md bg-primary text-white disabled:bg-primary/50"
            >
              {loading ? (
                <LoadingIcon className="size-5 animate-spin" />
              ) : (
                t("update")
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateContactPopup;
