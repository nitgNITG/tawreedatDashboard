import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./usersReducer";
import { HistoryEntry } from "@/types/users";

export enum GiftType {
  SENDED = "sended",
  RECEIVED = "received",
}

export enum GiftStatus {
  USED = "used",
  UNUSED = "unused",
  EXPIRED = "expired",
}

export interface GiftCard {
  id: number;
  userFromId: string;
  QR: string;
  walletHistoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  point: number;
  validTo: Date | null;
  email: string | null;
  message: string | null;
  phone: string | null;
  name: string | null;
  paymentamount: number | null;
  type: GiftType;
  userToId: string | null;
  status: GiftStatus;
  receivedDate: Date | null;
  validFrom: Date | null;
  userFrom: User;
  userTo?: User | null;
  walletHistory?: HistoryEntry | null;
}

type GiftCardsState = {
  giftCards: GiftCard[];
  isLastPage: boolean;
  giftCardById: GiftCard | null;
  lastDoc: any;
};

const initialState: GiftCardsState = {
  giftCards: [],
  isLastPage: false,
  giftCardById: null,
  lastDoc: null,
};

export const giftCardsSlice = createSlice({
  name: "giftCards",
  initialState,
  reducers: {
    setGiftCards(state, action: PayloadAction<GiftCard[]>) {
      state.giftCards = action.payload;
    },

    setIsLastPage(state, action: PayloadAction<boolean>) {
      state.isLastPage = action.payload;
    },

    getGiftCardById(state, action: PayloadAction<number>) {
      const giftCard = state.giftCards.find(
        (giftCard) => giftCard.id === action.payload
      );
      state.giftCardById = giftCard || null;
    },

    addGiftCard(state, action: PayloadAction<GiftCard>) {
      state.giftCards.push(action.payload);
    },

    updateGiftCard(state, action: PayloadAction<GiftCard>) {
      const index = state.giftCards.findIndex(
        (giftCard) => giftCard.id === action.payload.id
      );
      if (index !== -1) {
        state.giftCards[index] = action.payload;
      }
    },

    deleteGiftCard(state, action: PayloadAction<number>) {
      state.giftCards = state.giftCards.filter(
        (giftCard) => giftCard.id !== action.payload
      );
    },

    setLastDoc(state, action: PayloadAction<any>) {
      state.lastDoc = action.payload;
    },
  },
});

export const {
  setGiftCards,
  setIsLastPage,
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  getGiftCardById,
  setLastDoc,
} = giftCardsSlice.actions;

export default giftCardsSlice.reducer;
