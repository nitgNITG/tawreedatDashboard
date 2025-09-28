import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserType = {
  id: number;
  userType: string;
  color?: string;
  buyAmount: number;
  ratio: number;
  badgeId?: number;
  badge?: Badge;
  createdAt: string;
  updatedAt: string;
};

export type Badge = {
  id: number;
  name: string;
  points: number;
  minAmount: number;
  maxAmount: number;
  cover: string;
  logo: string;
  color?: string;
  textColor?: string;
  users?: number;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
  userType?: UserType;
};

type BadgesState = {
  badges: Badge[];
  isLastPage: boolean;
  badgeById: Badge | null;
  lastDoc: any;
};

const initialState: BadgesState = {
  badges: [],
  isLastPage: false,
  badgeById: null,
  lastDoc: null,
};

export const badgesSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {
    setBadges(state, action: PayloadAction<Badge[]>) {
      state.badges = action.payload;
    },

    setIsLastPage(state, action: PayloadAction<boolean>) {
      state.isLastPage = action.payload;
    },

    getBadgeById(state, action: PayloadAction<number>) {
      const badge = state.badges.find((badge) => badge.id === action.payload);
      state.badgeById = badge || null;
    },

    addBadge(state, action: PayloadAction<Badge>) {
      state.badges.push(action.payload);
    },

    updateBadge(state, action: PayloadAction<Badge>) {
      const index = state.badges.findIndex(
        (badge) => badge.id === action.payload.id
      );
      if (index !== -1) {
        state.badges[index] = action.payload;
      }
    },

    deleteBadge(state, action: PayloadAction<number>) {
      state.badges = state.badges.filter(
        (badge) => badge.id !== action.payload
      );
    },

    setLastDoc(state, action: PayloadAction<any>) {
      state.lastDoc = action.payload;
    },
  },
});

export const {
  setBadges,
  setIsLastPage,
  getBadgeById,
  addBadge,
  updateBadge,
  deleteBadge,
  setLastDoc,
} = badgesSlice.actions;

export default badgesSlice.reducer;
