import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    pets: any[]
    petsSearch: any[],
}

const initialState: initialStateType = {
    pets: [],
    petsSearch: [],
}
export const petsSlice = createSlice({
    name: 'pets',
    initialState,
    reducers: {
        setPets(state, action: PayloadAction<any[]>) {
            state.pets = action.payload
        },
        addPet(state, action: PayloadAction<any>) {
            state.pets.push(action.payload)
        },
        updatePet(state, action: PayloadAction<any>) {
            const index = state.pets.findIndex(pro => pro.id === action.payload.id)
            state.pets[index] = { ...action.payload }
        },
        deletePet(state, action: PayloadAction<any>) {
            state.pets = state.pets.filter(category => category.id !== action.payload)
        },
    }
})

export const { setPets, addPet, updatePet, deletePet } = petsSlice.actions
