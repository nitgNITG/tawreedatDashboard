"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { LoadingIcon } from "./icons";
import { useTranslations } from "next-intl";

interface DeleteDialogProps {
  onClose: () => void;
  onDelete: (permanent?: boolean) => Promise<void>;
  titlePermanent?: string;
  descriptionPermanent?: string;
  title: string;
  description: string;
  isOpen: boolean;
}

const DeleteDialog = ({
  isOpen,
  onClose,
  onDelete,
  titlePermanent,
  descriptionPermanent,
  title,
  description,
}: DeleteDialogProps) => {
  const [deleteType, setDeleteType] = useState<"archive" | "permanent">(
    "permanent"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const t = useTranslations("common");

  const handleDelete = async () => {
    setLoading(true);
    await onDelete(deleteType === "permanent");
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {deleteType === "permanent" ? titlePermanent ?? title : title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-base">
            {deleteType === "permanent"
              ? descriptionPermanent ?? description
              : description}
          </DialogDescription>
        </DialogHeader>

        {titlePermanent && (
          <div className="flex gap-3 mb-5 mt-2">
            <Button onClick={() => setDeleteType("archive")}>
              {t("archive")}
            </Button>
            <Button
              onClick={() => setDeleteType("permanent")}
              variant="destructive"
            >
              {t("permanentDelete")}
            </Button>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button onClick={() => onClose()} variant="outline">
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={loading}
          >
            {loading && <LoadingIcon className="size-5 animate-spin" />}
            {!loading &&
              (deleteType === "permanent" ? t("delete") : t("archive"))}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
