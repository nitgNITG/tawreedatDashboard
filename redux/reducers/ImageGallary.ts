import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    images: any[]
    imagesSearch: any[],
    isLastPage: boolean
}

const initialState: initialStateType = {
    images: [],
    imagesSearch: [],
    isLastPage: false
}
export const imagesSlice = createSlice({
    name: 'images',
    initialState,
    reducers: {
        setImages(state, action: PayloadAction<any[]>) {
            state.images = action.payload
        },
    }
})

export const { setImages } = imagesSlice.actions
