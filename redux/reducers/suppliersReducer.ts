import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    suppliers: any[]
    suppliersSearch: any[],
    count: number;
    isLastPage: boolean
}

const initialState: initialStateType = {
    suppliers: [],
    suppliersSearch: [],
    count: 0,
    isLastPage: false,
    // lastDoc
}

export const suppliersReducer = createSlice({
    name: 'suppliers',
    initialState,
    reducers: {
        setSuppliers(state, action: PayloadAction<any[]>) {
            state.suppliers = action.payload;
        },
        setSearchSuppliers(state, action: PayloadAction<any[]>) {
            state.suppliersSearch = action.payload;
        },
        setSuppliersCount(state, action: PayloadAction<number>) {
            state.count = action.payload
        },
        blockUser(state, action: PayloadAction<{ id: string, isBlock: boolean }>) {
            state.suppliers.find(supplier => {
                return supplier.id === action.payload.id
            }).isBlock == action.payload.isBlock
        },
        setIsLastPage(state, action: PayloadAction<boolean>) {
            state.isLastPage = action.payload;
        }
    }
})

export const { setSuppliers, setSearchSuppliers, setSuppliersCount, blockUser, setIsLastPage } = suppliersReducer.actions;
