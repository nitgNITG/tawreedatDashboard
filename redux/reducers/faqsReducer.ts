import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
  faqs: any;
};

const initialState: initialStateType = {
  faqs: null,
};
export const faqsSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {
    setFaqs(state, action: PayloadAction<any[]>) {
      state.faqs = action.payload;
    },
    addFaqs(state, action: PayloadAction<any>) {
      state.faqs.push(action.payload);
    },
    updateFaqs(state, action: PayloadAction<any>) {
      const index = state.faqs.findIndex(
        (f: { id: string }) => f.id === action.payload.id
      );
      state.faqs[index] = action.payload;
    },
    deleteFaqs(state, action: PayloadAction<any>) {
      state.faqs = state.faqs.filter(
        (f: { id: string }) => f.id !== action.payload
      );
    },
  },
});

export const { setFaqs, addFaqs, updateFaqs, deleteFaqs } = faqsSlice.actions;
