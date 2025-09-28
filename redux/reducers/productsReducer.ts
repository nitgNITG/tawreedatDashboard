import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
  products: any[];
  productsSearch: any[];
};

const initialState: initialStateType = {
  products: [],
  productsSearch: [],
};
export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<any[]>) {
      state.products = action.payload;
    },
    addProduct(state, action: PayloadAction<any>) {
      state.products.unshift(action.payload);
    },
    updateProduct(state, action: PayloadAction<any>) {
      const index = state.products.findIndex(
        (pro) => pro.id === action.payload.id
      );
      state.products[index] = action.payload;
    },
    deleteProduct(state, action: PayloadAction<any>) {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
  },
});

export const { setProducts, addProduct, updateProduct, deleteProduct } =
  productsSlice.actions;
