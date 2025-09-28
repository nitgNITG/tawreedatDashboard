import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DashboardInitialState = {
    users: number,
    suppliers: number,
    categories: number,  // Fixed typo from "categoryies" to "categories"
    products: number,
    images: number,
    articles: number,
    orders: number,
    faqs: number,  // Changed to lowercase "faqs" to follow consistent naming convention
    coupons: number
}

const initialState: DashboardInitialState = {
    users: 0,
    suppliers: 0,
    categories: 0,
    products: 0,
    images: 0,
    articles: 0,
    orders: 0,
    faqs: 0,
    coupons: 0
};

export const dashboardReducer = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setDashboardData(state, action: PayloadAction<Partial<DashboardInitialState>>) {
            return { ...state, ...action.payload };
        },
    }
});

export const { setDashboardData } = dashboardReducer.actions;
