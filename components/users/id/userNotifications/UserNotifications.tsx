"use client";
import { UserNotification } from "@/app/[locale]/users/[id]/UserNotificationsData";
import { LoadingIcon } from "@/components/icons";
import DownloadButton from "@/components/ui/DownloadButton";
import Pagination from "@/components/ui/Pagination";
import Table, { TableHeader } from "@/components/ui/Table";
import { useAppContext } from "@/context/appContext";
import { DateToText } from "@/lib/DateToText";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const UserNotifications = ({
  userNotificationsData,
  totalUserNotifications,
  totalPages,
  userId,
}: {
  userNotificationsData: UserNotification[];
  totalUserNotifications: number;
  totalPages: number;
  userId: string;
}) => {
  const t = useTranslations("user");
  const { token } = useAppContext();
  const locale = useLocale() as "en" | "ar";
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [userNotifications, setUserNotifications] = useState<
    UserNotification[] | []
  >([]);

  const headers: TableHeader[] = [
    { name: "notification" },
    { name: "delivered" },
    { name: "read" },
    { name: "action", className: "text-center" },
  ];

  useEffect(() => {
    setUserNotifications(userNotificationsData);
  }, []);

  const handleResend = async (notificationId: string) => {
    try {
      setResendingId(notificationId);
      await axios.post(
        `/api/users/notifications/${notificationId}/resend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "accept-language": locale,
          },
        }
      );
      toast.success(t("notificationResent"));
    } catch (error: any) {
      console.error("Error resending notification:", error);
      toast.error(error?.response?.data?.message ?? t("errorResending"));
    } finally {
      setResendingId(null);
    }
  };

  return (
    <Table
      headers={headers}
      bgColor
      pagination={
        <Pagination
          bgColor
          count={totalUserNotifications}
          totalPages={totalPages}
          downloadButton={
            <DownloadButton<UserNotification>
              model="order"
              fields={["id"]}
              apiUrl="/api/users/notifications/download"
            />
          }
        />
      }
    >
      {!userNotifications.length && (
        <tr className="odd:bg-white even:bg-primary/5 border-b">
          <td
            colSpan={headers.length}
            scope="row"
            className="px-6 py-4 text-center font-bold"
          >
            {t("no data yet")}
          </td>
        </tr>
      )}
      {userNotifications?.map((notification: UserNotification) => (
        <tr
          key={notification.id}
          className={"odd:bg-white even:bg-[#F0F2F5]  border-b"}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            {locale === "en" ? notification.title : notification.titleAr}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {DateToText(notification.createdAt, locale)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {notification.read ? "yes" : "- - - -"}
          </td>
          <td className="px-6 py-4">
            <button
              onClick={() => handleResend(notification.id)}
              disabled={resendingId === notification.id}
              type="button"
              className="hover:opacity-80 transition-opacity p-2 rounded-2xl text-[0.7rem] bg-primary text-white disabled:bg-primary/70 flex justify-center items-center"
            >
              {resendingId === notification.id ? (
                <LoadingIcon className="size-4 animate-spin" />
              ) : (
                t("resend")
              )}
            </button>
          </td>
        </tr>
      ))}
    </Table>
  );
};

export default UserNotifications;
