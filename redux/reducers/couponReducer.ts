import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    coupons: any[]
    couponsSearch: any[],
    isLastPage: boolean,
}

const initialState: initialStateType = {
    coupons: [],
    couponsSearch: [],
    isLastPage: false,
}
export const couponsSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {
        setCoupons(state, action: PayloadAction<any[]>) {
            state.coupons = action.payload
        },
        addCoupons(state, action: PayloadAction<any>) {
            state.coupons.push(action.payload)
        },
        updateCoupons(state, action: PayloadAction<any>) {
            const index = state.coupons.findIndex(i => i.id === action.payload.id)
            state.coupons[index] = { ...action.payload }
        },
        deleteCoupons(state, action: PayloadAction<any>) {
            state.coupons = state.coupons.filter(i => i.id !== action.payload)
        },
    }
})

export const { setCoupons, addCoupons, updateCoupons, deleteCoupons } = couponsSlice.actions
