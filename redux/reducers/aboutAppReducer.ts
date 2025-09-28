import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    aboutData: any
}

const initialState: initialStateType = {
    aboutData: null
}
export const aboutDataSlice = createSlice({
    name: 'about',
    initialState,
    reducers: {
        setAboutData(state, action: PayloadAction<any[]>) {
            state.aboutData = action.payload
        },
        updateAboutData(state, action: PayloadAction<any>) {
            state.aboutData = { ...action.payload }
        },
    }
})

export const { setAboutData, updateAboutData } = aboutDataSlice.actions