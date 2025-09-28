import { Brand } from "@/components/users/BrandSelect";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

enum AdsStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export enum AdsPlacement {
  Top = "Top",
  Middle = "Middle",
  Bottom = "Bottom",
}

export enum AdsType {
  Home = "Home",
  Popup = "Popup",
}

export enum AdsFrequency {
  Once = "Once",
  Daily = "Daily",
  PerSession = "PerSession",
}

export type Ad = {
  id: number;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  imageUrl: string;
  targetUrl: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  priority: number;
  status: AdsStatus;
  placement?: AdsPlacement;
  adType: AdsType;
  frequency?: AdsFrequency;
  timing: number;
  closable?: boolean;
  displayDuration: number;
  createdAt?: Date;
};

type InitialStateType = {
  ads: Ad[];
  adsSearch: Ad[];
  isLastPage: boolean;
  totalCount: number;
};

const initialState: InitialStateType = {
  ads: [],
  adsSearch: [],
  isLastPage: false,
  totalCount: 0,
};

export const adsSlice = createSlice({
  name: "ads",
  initialState,
  reducers: {
    setAds(state, action: PayloadAction<{ ads: Ad[]; totalCount: number }>) {
      state.ads = action.payload.ads;
      state.totalCount = action.payload.totalCount;
    },
    addAds(state, action: PayloadAction<Ad>) {
      state.ads.push(action.payload);
      state.ads.sort((a, b) => a.priority - b.priority); // <-- Sort by priority (ascending)
      state.totalCount += 1;
    },
    updateAds(state, action: PayloadAction<Ad>) {
      const index = state.ads.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.ads[index] = { ...action.payload };
        state.ads.sort((a, b) => a.priority - b.priority); // <-- Keep sorted after update
      }
    },
    deleteAds(state, action: PayloadAction<number>) {
      state.ads = state.ads.filter((i) => i.id !== action.payload);
      state.totalCount -= 1;
    },
  },
});

export const { setAds, addAds, updateAds, deleteAds } = adsSlice.actions;
