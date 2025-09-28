"use client";
import { useEffect } from "react";
import { requestNotificationPermission, messaging } from "@/config/firebase";
import { onMessage } from "firebase/messaging";
import axios from "axios";
import { useAppDispatch } from "@/hooks/redux";
import { useAppContext } from "@/context/appContext";
import {
  addNotification,
  NotificationState,
  setNotifications,
} from "@/redux/reducers/notificationSlice";
import toast from "react-hot-toast";

export const fetchNotifications = async (token: string | undefined) => {
  try {
    if (!token) {
      throw new Error("Token is undefined");
    }
    const { data } = await axios.get(`/api/users/notifications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error };
  }
};
// totalUnreadNotifications

const NotificationHandler = ({
  notifications,
  totalNotifications,
  totalPages,
  unreadCount,
}: NotificationState) => {
  const dispatch = useAppDispatch();
  const { token } = useAppContext();

  useEffect(() => {
    if (notifications && totalNotifications && totalPages && unreadCount) {
      dispatch(
        setNotifications({
          notifications,
          totalNotifications,
          totalPages,
          unreadCount,
        })
      );
    }
  }, [notifications, totalNotifications, totalPages, dispatch]);

  useEffect(() => {
    const setupNotifications = async () => {
      if (!messaging) return;

      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken && token) {
          await axios.post(
            `/api/users/fcm-token`,
            { fcmToken },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, [token]);

  useEffect(() => {
    let unsubscribe = () => {};

    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log("New Notification Received:", payload);

        // Transform Firebase payload to UserNotification format
        const userNotification = {
          id: payload.data?.notificationId ?? Date.now().toString(),
          desc: payload.notification?.body ?? "",
          descAr: payload.notification?.body ?? "",
          title: payload.notification?.title ?? "",
          titleAr: payload.notification?.title ?? "",
          createdAt: new Date().toISOString(),
          data: {
            notificationId: payload.data?.notificationId ?? "",
            route: payload.data?.route ?? "",
            brandId: payload.data?.brandId ?? "",
          },
          read: false,
          userId: payload.data?.userId,
          user: payload.data?.user ?? null,
        };

        dispatch(addNotification(userNotification));
        toast.success(payload.notification?.body ?? "New notification");
      });
    }

    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   // Debug logging
  //   console.log("Messaging instance:", messaging);
  //   console.log("Notification permission:", Notification.permission);

  //   if (!messaging) {
  //     console.error("Firebase messaging not initialized");
  //     return;
  //   }
  // }, []);

  return null;
};

export default NotificationHandler;
