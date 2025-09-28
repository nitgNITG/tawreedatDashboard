import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    translate: any[]
    translateSearch: any[],
    count: number,
    isLastPage: boolean
}

const initialState: initialStateType = {
    translate: [],
    translateSearch: [{}],
    count: 0,
    isLastPage: false
}

export const translateReducer = createSlice({
    name: 'translate',
    initialState,
    reducers: {
        setTranslate(state, action: PayloadAction<any[]>) {
            state.translate = action.payload;
        },
        setSearchTranslate(state, action: PayloadAction<any[]>) {
            state.translateSearch = action.payload;
        },
        setTranslateCount(state, action: PayloadAction<number>) {
            state.count = action.payload
        },

    }
})

export const { setTranslate, setSearchTranslate, setTranslateCount } = translateReducer.actions;
