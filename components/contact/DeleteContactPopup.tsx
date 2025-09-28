import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import axios from "axios";
import { useAppDispatch } from "@/hooks/redux";
import { Contact } from "@/types/contact";
import toast from "react-hot-toast";
import { LoadingIcon } from "../icons";
import { useAppContext } from "@/context/appContext";
import { useState } from "react";
import { deleteContact } from "@/redux/reducers/contactsReducer";

const DeleteContactPopup = ({
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
  const t = useTranslations("contact");
  const dispatch = useAppDispatch();
  const { token } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClose = () => {
    setContact(null);
    setOpenForm(false);
  };

  const handleDeleteContact = async () => {
    if (!contact) return;
    try {
      setLoading(true);
      await axios.delete(`/api/contact-us/${contact.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(deleteContact(contact.id));
      toast.success(t("successDelete"));
      handleClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "There is an Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openForm} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteContact")}</DialogTitle>
          <DialogDescription>{t("deleteMessage")}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenForm(false)}
            className="px-3 py-2 rounded-md border"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleDeleteContact}
            className="px-3 py-2 rounded-md bg-red-500 text-white"
          >
            {loading ? (
              <LoadingIcon className="size-5 animate-spin" />
            ) : (
              t("delete")
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteContactPopup;
