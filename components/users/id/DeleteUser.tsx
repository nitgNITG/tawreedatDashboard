"use client";
import { LoadingIcon } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppContext } from "@/context/appContext";
import { useAppDispatch } from "@/hooks/redux";
import { useRouter } from "@/i18n/routing";
import { deleteUser, User } from "@/redux/reducers/usersReducer";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import toast from "react-hot-toast";

const DeleteUser = ({
  user,
  openDelete,
  setOpenDelete,
  showBtn = false,
}: {
  user: User;
  openDelete: boolean;
  setOpenDelete: (openDelete: boolean) => void;
  showBtn?: boolean;
}) => {
  const { token } = useAppContext();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteType, setDeleteType] = useState<"archive" | "permanent">(
    "archive"
  );
  const t = useTranslations("user");
  const router = useRouter();
  const locale = useLocale() || "ar";

  const handleDeleteAccount = async () => {
    if (!user.id) return;
    try {
      setLoading(true);

      await axios.delete(
        `/api/users/${user.id}${
          deleteType === "archive" ? "?archived=true" : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );

      if (deleteType === "archive") dispatch(deleteUser(user.id));
      setOpenDelete(false);

      // Different success messages
      const successMessage =
        deleteType === "permanent" ? t("successDelete") : t("successArchive");

      toast.success(successMessage);

      // If on user detail page, redirect back to users list after deletion
      if (
        deleteType === "permanent" ||
        window.location.pathname.includes(`/users/${user.id}`)
      ) {
        router.push("/users");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message ?? "There is an Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
      {showBtn && (
        <DialogTrigger asChild>
          <button
            onClick={() => setOpenDelete(true)}
            className="py-2 px-10 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {t("deleteAccount")}
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {deleteType === "permanent"
              ? t("permanentDelete")
              : t("archiveUser")}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {deleteType === "permanent"
              ? t("permanentDeleteMessageWithName", { name: user.fullname })
              : t("archiveMessageWithName", { name: user.fullname })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-5 mt-2">
          <button
            onClick={() => setDeleteType("archive")}
            className={`flex-1 px-4 py-2.5 rounded-md border transition-colors font-medium ${
              deleteType === "archive"
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200"
            }`}
          >
            {t("archive")}
          </button>
          <button
            onClick={() => setDeleteType("permanent")}
            className={`flex-1 px-4 py-2.5 rounded-md border transition-colors font-medium ${
              deleteType === "permanent"
                ? "bg-red-500 text-white border-red-500"
                : "bg-gray-50 hover:bg-gray-100 border-gray-200"
            }`}
          >
            {t("permanentDelete")}
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setOpenDelete(false)}
            className="px-5 py-2.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleDeleteAccount}
            className={`px-5 py-2.5 rounded-md text-white font-medium transition-colors ${
              deleteType === "permanent"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
            disabled={loading}
          >
            {loading && <LoadingIcon className="size-5 animate-spin" />}
            {!loading &&
              (deleteType === "permanent" ? t("delete") : t("archive"))}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUser;
