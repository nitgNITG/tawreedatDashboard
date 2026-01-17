"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAppContext } from "@/context/appContext";
import { useTranslations } from "next-intl";
import { useState } from "react";
import axios from "axios";
import { LoadingIcon } from "../icons";
import toast from "react-hot-toast";
import { UserRole } from "@/types/userRole";

const DeleteUserRole = ({
  openDelete,
  setOpenDelete,
  deleteRole,
  onDeleted,
}: {
  openDelete: boolean;
  deleteRole: UserRole;
  setOpenDelete: (openDelete: boolean) => void;
  onDeleted: (id: string, deletedAt: string) => void;
}) => {
  const t = useTranslations("userRoles");
  const { token } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleDeleteRole = async () => {
    try {
      setLoading(true);

      const { data } = await axios.delete(`/api/roles/${deleteRole.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // backend returns updated role (soft delete) or just success
      // safest: set deleted_at now even if backend doesn't return it
      const deletedAt = data?.data?.deleted_at ?? new Date().toISOString();

      onDeleted(deleteRole.id, deletedAt);
      setOpenDelete(false);

      toast.success(t("toast.deleteSuccess"));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message ?? t("toast.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteRole")}</DialogTitle>
          <DialogDescription>{t("deleteMessage")}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setOpenDelete(false)}
            className="px-3 py-2 rounded-md border"
          >
            {t("cancel")}
          </button>

          <button
            onClick={handleDeleteRole}
            className="px-3 py-2 rounded-md bg-red-500 text-white"
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
  );
};

export default DeleteUserRole;
