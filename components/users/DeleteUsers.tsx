"use client";
import { useState } from "react";
import { LoadingIcon } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppContext } from "@/context/appContext";
import axios from "axios";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const DeleteUsers = () => {
  const { token } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteType, setDeleteType] = useState<"deleted" | "unconfirmed">(
    "deleted"
  );
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const t = useTranslations("user");
  const router = useRouter();

  const handleDeleteUsers = async () => {
    try {
      setLoading(true);

      await axios.delete(`/api/users/bulk?deleteType=${deleteType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOpenDelete(false);
      const successMessage =
        deleteType === "deleted"
          ? t("successDeletedUsers")
          : t("successUnconfirmedUsers");

      toast.success(successMessage);

      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "There is an Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end gap-3">
      <button
        onClick={() => {
          setDeleteType("deleted");
          setOpenDelete(true);
        }}
        className="py-2 px-10 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
      >
        {t("deleteArchivedUsers")}
      </button>
      <button
        onClick={() => {
          setDeleteType("unconfirmed");
          setOpenDelete(true);
        }}
        className="py-2 px-10 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
      >
        {t("deleteUnconfirmedUsers")}
      </button>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {deleteType === "deleted"
                ? t("deleteArchivedUsers")
                : t("deleteUnconfirmedUsers")}
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              {deleteType === "deleted"
                ? t("deleteArchivedUsersConfirmation")
                : t("deleteUnconfirmedUsersConfirmation")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end mt-4">
            <button
              onClick={() => setOpenDelete(false)}
              className="px-5 py-2.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleDeleteUsers}
              className={`px-5 py-2.5 rounded-md text-white font-medium transition-colors bg-red-500 hover:bg-red-600`}
              disabled={loading}
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
    </div>
  );
};

export default DeleteUsers;
