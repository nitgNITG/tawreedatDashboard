"use client";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { useAppContext } from "@/context/appContext";
import { useState } from "react";
import {
  appendNotifications,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationRead,
} from "@/redux/reducers/notificationSlice";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";
import { X } from "lucide-react";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const NotificationsList = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppContext();
  const [loading, setLoading] = useState(false);
  const { notifications, totalNotifications } = useAppSelector(
    (state) => state.notifications
  );
  const locale = useLocale();
  const t = useTranslations("notifications");

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return t("timeAgo.justNow");
    } else if (diffInHours < 24) {
      return t(diffInHours === 1 ? "timeAgo.hourAgo" : "timeAgo.hoursAgo", {
        count: diffInHours,
      });
    } else {
      return t(diffInDays === 1 ? "timeAgo.dayAgo" : "timeAgo.daysAgo", {
        count: diffInDays,
      });
    }
  };

  const loadMoreNotifications = async () => {
    try {
      setLoading(true);
      const skip = notifications.length;
      const { data } = await axios.get(`/api/users/notifications?skip=${skip}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data) {
        dispatch(
          appendNotifications({
            notifications: data.userNotifications,
            totalNotifications: data.totalUserNotifications,
            totalPages: data.totalPages,
            unreadCount: data.totalUnreadNotifications,
          })
        );
      }
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await axios.delete(`/api/users/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(deleteNotification(id));
      toast.success(t("deleteSuccess"));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(t("deleteError"));
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete(`/api/users/notifications/delete-all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(deleteAllNotifications());
      toast.success(t("deleteAllSuccess"));
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error(t("deleteAllError"));
    }
  };

  // Add this function with the other handlers
  const handleMarkAsRead = async (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification?.read) return;

    try {
      await axios.patch(`/api/users/notifications/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(updateNotificationRead(id));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="bg-white p-3 md:p-5 rounded-3xl min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <span className="text-sm text-gray-500">
            ({notifications.length}/{totalNotifications})
          </span>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="text-sm text-primary hover:text-primary/35"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{t("empty")}</p>
      ) : (
        <>
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={clsx(
                  "rounded-lg p-4 relative group",
                  notification.read
                    ? "bg-[#F0D7F5] text-gray-700"
                    : "bg-white border border-[#e8f5f5]"
                )}
              >
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className={clsx(
                    "absolute top-4 bg-white border-2 p-2 end-4",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
                    "hover:opacity-100 hover:shadow-lg rounded-full shadow text-secondary",
                    " drop-shadow-2xl ring-offset-background transition-all"
                  )}
                >
                  <X className="size-4" />
                </button>

                <div className="flex flex-col">
                  <p className="text-gray-800 mb-1">
                    {locale === "en" ? notification.desc : notification.descAr}{" "}
                    {notification?.data?.route && (
                      <Link
                        href={notification.data.route}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-primary hover:underline"
                      >
                        {notification.data.route.includes("order")
                          ? t("openOrderDetails")
                          : t("offerDetails")}
                      </Link>
                    )}
                  </p>
                  <span className="text-xs text-gray-500">
                    {getRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {notifications.length < totalNotifications && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMoreNotifications}
                disabled={loading}
                className="px-4 py-2 text-primary hover:text-primary/35 disabled:text-primary/20"
              >
                {loading ? t("loading") : t("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsList;
