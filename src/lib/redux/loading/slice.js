import {createSlice} from "@reduxjs/toolkit"

export const LoadingSlice = createSlice({
    name: 'LoadingSlice',
    initialState: {
        statusLoading: false
    },
    reducers: {
        startLoading: (state) => {
            state.statusLoading = true
            return state
        },
        stopLoading: (state) => {
            state.statusLoading = false
            return state
        }
    }
})

export const {startLoading, stopLoading} = LoadingSlice.actions

export default LoadingSlice.reducer