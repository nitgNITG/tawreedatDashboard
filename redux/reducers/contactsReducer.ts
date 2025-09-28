import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Contact, ContactState } from "@/types/contact";

const initialState: ContactState = {
  contacts: [],
  totalCount: 0,
  totalPages: 0,
};

const contactsReducer = createSlice({
  name: "contact",
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<ContactState>) => {
      state.contacts = action.payload.contacts;
      state.totalCount = action.payload.totalCount;
      state.totalPages = action.payload.totalPages;
    },
    deleteContact: (state, action: PayloadAction<number>) => {
      state.contacts = state.contacts.filter(
        (contact) => contact.id !== action.payload
      );
      state.totalCount--;
    },
    updateContact: (state, action: PayloadAction<Contact>) => {
      const index = state.contacts.findIndex(
        (contact) => contact.id === action.payload.id
      );
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
  },
});

export const { setContacts, deleteContact, updateContact } =
  contactsReducer.actions;
export default contactsReducer;
