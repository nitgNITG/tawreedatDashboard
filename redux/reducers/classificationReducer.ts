import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ClassificationPolicy {
  id: number
  name: string
  monthsPeriod: number
  purchaseCount: number
  color: string
  description: string
  createdAt: string
  updatedAt: string
}

interface ClassificationState {
  classifications: ClassificationPolicy[]
  loading: boolean
  error: string | null
}

const initialState: ClassificationState = {
  classifications: [],
  loading: false,
  error: null
}

const classificationSlice = createSlice({
  name: 'classification',
  initialState,
  reducers: {
    deleteClassification: (state, action: PayloadAction<number>) => {
      state.classifications = state.classifications.filter(
          (        classification: { id: number }) => classification.id !== action.payload
      )
    },
    // Add other reducers as needed
  }
})

export const { deleteClassification } = classificationSlice.actions
export default classificationSlice.reducer 