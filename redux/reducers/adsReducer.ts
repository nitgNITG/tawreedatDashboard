import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AdsStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED";

export enum AdsPlacement {
  Top = "Top",
  Middle = "Middle",
  Bottom = "Bottom",
}

export enum AdsType { "EXTERNAL" , "INTERNAL"}

export enum AdsFrequency {
  Once = "Once",
  Daily = "Daily",
  PerSession = "PerSession",
}

export type Ad = {
  id: number;
  title: string;
  title_ar: string;
  description?: string;
  description_ar?: string;
  image_url: string;
  target_url?: string;
  mobile_screen?: string;
  start_date: Date;
  end_date: Date;
  budget: number;
  priority: number;
  status: AdsStatus;
  placement?: AdsPlacement;
  ad_type: AdsType;
  frequency?: AdsFrequency;
  timing: number;
  closable?: boolean;
  duration_seconds: number;
  created_at?: Date;
};

type InitialStateType = {
  ads: Ad[];
  adsSearch: Ad[];
  isLastPage: boolean;
  totalCount: number;
  selectedAd: Ad | null;
};

const initialState: InitialStateType = {
  ads: [],
  adsSearch: [],
  isLastPage: false,
  totalCount: 0,
  selectedAd: null, // Initialize as null
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
    setSelectedAd(state, action: PayloadAction<Ad | null>) {
      state.selectedAd = action.payload;
    },
  },
});

export const { setAds, addAds, updateAds, deleteAds, setSelectedAd } =
  adsSlice.actions;
