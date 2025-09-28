import { Ad, deleteAds } from "@/redux/reducers/adsReducer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import { useAppDispatch } from "@/hooks/redux";
import { useTranslations } from "next-intl";
import { LoadingIcon } from "../icons";

const DeleteAds = ({
  deleteAd,
  openDelete,
  setOpenDelete,
}: {
  deleteAd: Ad;
  openDelete: boolean;
  setOpenDelete: (openDelete: boolean) => void;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAppContext();
  const dispatch = useAppDispatch();
  const t = useTranslations("ads");

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/ads/${deleteAd.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(deleteAds(deleteAd.id));
      setOpenDelete(false);
      toast.success(t("successDelete"));
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      toast.error(error?.response?.data?.message || "There is an Error");
    }
  };

  return (
    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("delete")}</DialogTitle>
          <DialogDescription>{t("deleteMessage")}</DialogDescription>
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

export default DeleteAds;
