import React, { useState } from "react";
import { DeleteIcon, EditIcon, LoadingIcon } from "../icons";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import AddFAQs from "./AddFAQs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAppDispatch } from "@/hooks/redux";
import { deleteFaqs } from "@/redux/reducers/faqsReducer";
import { useAppContext } from "@/context/appContext";
import axios from "axios";

const FaqCard = ({
  id,
  ans,
  que,
}: {
  id: number;
  ans: string;
  que: string;
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { token } = useAppContext();

  const dispatch = useAppDispatch();
  const t = useTranslations("faqs");

  const handleEditFaqs = () => {
    setOpenEdit(true);
    document.body.style.overflowY = "hidden";
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);
      await axios.delete(`/api/faqs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(deleteFaqs(id));
      setOpenDelete(false);
      toast.success(t("successDelete"));
      setLoadingDelete(false);
    } catch (error: any) {
      setLoadingDelete(false);
      console.error(error);
      toast.error(error?.response?.data?.message || "There is an Error");
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg py-3 px-5 shadow-md space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg lg:text-xl font-semibold">{que}</h3>
          <p>{ans}</p>
        </div>
        <div className="space-x-3 flex gap-1">
          <button onClick={handleEditFaqs} className="block">
            <EditIcon className="size-6 hover:stroke-blue-500 duration-200" />
          </button>
          <button
            onClick={() => {
              setOpenDelete(true);
              document.body.style.overflowY = "hidden";
            }}
          >
            <DeleteIcon className="size-6 hover:stroke-red-500 duration-200" />
          </button>
        </div>
      </div>
      {openEdit && <AddFAQs faqs={{ id, ans, que }} setOpen={setOpenEdit} />}

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete.lable")}</DialogTitle>
            <DialogDescription>{t("delete.message")}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <button
              onClick={() => setOpenDelete(false)}
              className="px-3 py-2 rounded-md border"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-2 rounded-md bg-red-500 text-white"
            >
              {loadingDelete ? (
                <LoadingIcon className="size-5 animate-spin" />
              ) : (
                t("delete.btn")
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FaqCard;
