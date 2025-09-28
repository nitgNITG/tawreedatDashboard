import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    onboarding: any[]
    onboardingSearch: any[],
    isLastPage: boolean,
    lastDoc: any
}

const initialState: initialStateType = {
    onboarding: [],
    onboardingSearch: [],
    isLastPage: false,
    lastDoc: null
}
export const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        setOnBoarding(state, action: PayloadAction<any[]>) {
            state.onboarding = action.payload
        },
        setIsLastPage(state, action: PayloadAction<boolean>) {
            state.isLastPage = action.payload;
        },
        setLastDoc(state, action: PayloadAction<any>) {
            state.lastDoc = action.payload
        },
        addOnBoarding(state, action: PayloadAction<any>) {
            state.onboarding.push(action.payload)
        },
        updateOnBoarding(state, action: PayloadAction<any>) {
            const index = state.onboarding.findIndex(i => i.id === action.payload.id)
            state.onboarding[index] = action.payload
        },
        deleteOnBoarding(state, action: PayloadAction<any>) {
            state.onboarding = state.onboarding.filter(i => i.id !== action.payload)
        },
    }
})

export const { setOnBoarding, setIsLastPage, setLastDoc, addOnBoarding, updateOnBoarding, deleteOnBoarding } = onboardingSlice.actions
