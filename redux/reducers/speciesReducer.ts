import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type initialStateType = {
    species: any[]
    speciesSearch: any[],
    speciesbyId: null,
    lastDoc: any
}

const initialState: initialStateType = {
    species: [],
    speciesSearch: [],
    speciesbyId: null,
    lastDoc: null
}
export const speciesSlice = createSlice({
    name: 'species',
    initialState,
    reducers: {
        setspecies(state, action: PayloadAction<any[]>) {
            state.species = action.payload
        },
        getspeciesById(state, action: PayloadAction<string>) {
            const species = state.species.find((species) => {
                return species.id === action.payload
            })
            return { ...state, speciesbyId: species }
        },
        addspecies(state, action: PayloadAction<any>) {
            state.species.push(action.payload)
        },
        updatespecies(state, action: PayloadAction<any>) {
            const index = state.species.findIndex(species => species.id === action.payload.id)
            state.species[index] = action.payload
        },
        deletespecies(state, action: PayloadAction<any>) {
            state.species = state.species.filter(species => species.id !== action.payload)
        },
        setLastDoc(state, action: PayloadAction<any>) {
            state.lastDoc = action.payload
        }
    }
})

export const { setspecies,
    addspecies,
    getspeciesById,
    updatespecies,
    deletespecies,
    setLastDoc
} = speciesSlice.actions
