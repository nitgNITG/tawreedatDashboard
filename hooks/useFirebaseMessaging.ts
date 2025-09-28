import { useEffect, useState } from "react";
import { onMessage } from "firebase/messaging";
import { messaging, requestNotificationPermission } from "@/config/firebase";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import toast from "react-hot-toast";

export const useFirebaseMessaging = () => {
  const { token: authToken } = useAppContext();
  const [token, setToken] = useState("");
  const [notification, setNotification] = useState<any>(null);
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<string>("");
  const [fcmError, setFcmError] = useState<string | null>(null);

  const handleNotificationPermission = async () => {
    try {
      const fcmToken = await requestNotificationPermission();

      if (fcmToken) {
        setToken(fcmToken);
        console.log("FCM token:", fcmToken);
        setNotificationPermissionStatus("granted");
        setFcmError(null);
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/fcm-token`,
            {
              fcmToken,
            },
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          console.log("FCM token saved to server successfully");
        } catch (saveError) {
          console.error("Failed to save notification token:", saveError);
        }
      }
    } catch (error) {
      console.error("Error getting notification permission:", error);
      setFcmError("Failed to enable notifications");
    }
  };

  useEffect(() => {
    // Check current permission status without requesting
    if (typeof Notification !== "undefined") {
      setNotificationPermissionStatus(Notification.permission);
    }

    handleNotificationPermission();

    let unsubscribe = () => {};

    if (messaging) {
      try {
        // Use onMessage directly instead of onMessageListener
        unsubscribe = onMessage(messaging, (payload) => {
          console.log("Message received in foreground:", payload);
          setNotification(payload);
          toast.success(payload.notification?.body ?? "New notification");
        });
      } catch (error) {
        console.error("Error setting up message listener:", error);
        setFcmError("Failed to set up notifications listener");
      }
    }

    // Return cleanup function
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Function to update token when it's obtained elsewhere
  const updateToken = (newToken: string) => {
    setToken(newToken);
    setFcmError(null); // Clear any previous errors when token is successfully updated
  };

  // Function to update permission status when it changes
  const updatePermissionStatus = (status: string) => {
    setNotificationPermissionStatus(status);
  };

  // Function to set error state
  const setError = (error: string | null) => {
    setFcmError(error);
  };

  return {
    token,
    notification,
    notificationPermissionStatus,
    fcmError,
    updateToken,
    updatePermissionStatus,
    setError,
  };
};
