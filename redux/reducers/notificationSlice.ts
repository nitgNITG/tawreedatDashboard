import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserNotification } from "@/app/[locale]/users/[id]/UserNotificationsData";

export interface NotificationState {
  notifications: UserNotification[];
  totalNotifications: number;
  totalPages: number;
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  totalNotifications: 0,
  totalPages: 0,
  unreadCount: 0,
};

export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{
        notifications: UserNotification[];
        totalNotifications: number;
        totalPages: number;
        unreadCount: number;
      }>
    ) => {
      state.notifications = action.payload.notifications;
      state.totalNotifications = action.payload.totalNotifications;
      state.totalPages = action.payload.totalPages;
      state.unreadCount = action.payload.unreadCount;
    },
    addNotification: (state, action: PayloadAction<UserNotification>) => {
      state.notifications.unshift(action.payload);
      state.totalNotifications += 1;
      state.totalPages = Math.ceil(state.totalNotifications / 10);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      if (
        !state.notifications.find(
          (notification) => notification.id === action.payload
        )?.read
      ) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
      state.totalNotifications -= 1;
      state.totalPages = Math.ceil(state.totalNotifications / 10);
    },
    deleteAllNotifications: (state) => {
      state.notifications = [];
      state.totalNotifications = 0;
      state.totalPages = 0;
      state.unreadCount = 0;
    },
    appendNotifications: (
      state,
      action: PayloadAction<{
        notifications: UserNotification[];
        totalNotifications: number;
        totalPages: number;
        unreadCount: number;
      }>
    ) => {
      state.notifications = [
        ...state.notifications,
        ...action.payload.notifications,
      ];
      state.totalNotifications = action.payload.totalNotifications;
      state.totalPages = action.payload.totalPages;
      state.unreadCount = action.payload.unreadCount;
    },
    updateNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
});

export const {
  setNotifications,
  addNotification,
  deleteNotification,
  deleteAllNotifications,
  appendNotifications,
  updateNotificationRead, // Export the new action
} = notificationSlice.actions;
