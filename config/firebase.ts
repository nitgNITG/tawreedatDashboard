// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Firestore import and initialization
export const db = getFirestore(app);

// Safely check for browser environment before initializing browser-only features
const isBrowser = typeof window !== "undefined";
export let messaging: any = null;

// Check if the browser supports notifications
const isNotificationSupported = () => {
  return (
    isBrowser &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
};

// Initialize messaging only when needed, not on initial load
const initializeMessaging = () => {
  if (isBrowser && isNotificationSupported() && !messaging) {
    try {
      messaging = getMessaging(app);
      console.log("Firebase messaging initialized successfully");
      return messaging;
    } catch (error) {
      console.error("Firebase messaging initialization error:", error);
      return null;
    }
  }
  return messaging;
};

// Call initializeMessaging when the file is loaded
if (isBrowser) {
  initializeMessaging();
}

// Register service worker for FCM
const registerServiceWorker = async () => {
  if (!isBrowser || !isNotificationSupported()) {
    throw new Error("Notifications are not supported in this browser");
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: "/",
        updateViaCache: "none",
      }
    );
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    throw error;
  }
};

// Function to request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  if (!isBrowser || !isNotificationSupported()) {
    console.log("Notifications not supported in this environment");
    return null;
  }

  try {
    // Initialize messaging if not already done
    const messagingInstance = initializeMessaging();
    if (!messagingInstance) return null;

    // First register service worker
    await registerServiceWorker();

    // Then request permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      try {
        // Get registration token
        const currentToken = await getToken(messagingInstance, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (currentToken) {
          console.log("FCM token:", currentToken);
          return currentToken;
        } else {
          console.log("No registration token available");
          return null;
        }
      } catch (tokenError) {
        // For development environments, you might want to return a mock token
        if (process.env.NODE_ENV === "development") {
          console.log("Returning mock token for development");
          return "dev-mock-fcm-token-" + Date.now();
        }
        throw tokenError;
      }
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

// Function to handle incoming messages
export const onMessageListener = () => {
  if (!isBrowser || !isNotificationSupported()) {
    return Promise.resolve(null);
  }

  const messagingInstance = initializeMessaging();

  return new Promise((resolve) => {
    if (!messagingInstance) {
      resolve(null);
      return;
    }

    onMessage(messagingInstance, (payload) => {
      resolve(payload);
    });
  });
};

export { app };
