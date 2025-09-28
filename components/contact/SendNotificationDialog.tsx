"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/appContext";
import axios from "axios";
import toast from "react-hot-toast";
import { LoadingIcon } from "../icons";
import { Send } from "lucide-react";

interface SendNotificationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SendNotificationDialog = ({
  open,
  setOpen,
}: SendNotificationDialogProps) => {
  const t = useTranslations("contact");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAppContext();

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error(t("pleaseFieldTitleAndMessage"));
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        `/api/users/notifications/send-notification`,
        {
          title: title.trim(),
          desc: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(t("notificationSentSuccessfully"));
        setTitle("");
        setMessage("");
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      const errorMessage =
        error.response?.data?.message ??
        error.message ??
        t("failedToSendNotification");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("sendNotificationTo")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              {t("notificationTitle")}
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("enterNotificationTitle")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              {t("notificationMessage")}
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("enterNotificationMessage")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSendNotification}
            disabled={isLoading || !title.trim() || !message.trim()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingIcon className="size-4 mr-2 animate-spin inline" />
                {t("sending")}
              </>
            ) : (
              <>
                {t("sendNotification")}
                <Send className="inline size-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendNotificationDialog;
