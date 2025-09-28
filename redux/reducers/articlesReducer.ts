import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    articles: any[]
}

const initialState: initialStateType = {
    articles: [],
}
export const articlesSlice = createSlice({
    name: 'articles',
    initialState,
    reducers: {
        setArticles(state, action: PayloadAction<any[]>) {
            state.articles = action.payload
        },
    }
})

export const { setArticles, } = articlesSlice.actions