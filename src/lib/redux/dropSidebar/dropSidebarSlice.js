import { createSlice } from "@reduxjs/toolkit";

export const DropSideBarSlice = createSlice({
    name: 'DropSideBarSlice',
    initialState: {
        itemDrop:[],
        itemActive: null
    },
    reducers: {
        changDropItem: (state, action) =>{
            state.itemDrop = [...action.payload]
            state.itemActive = state.itemDrop[0]
            localStorage.setItem('indexItemDropActive', JSON.stringify(state.itemDrop))
            return state
        },
        removeItemDrop: (state, action) => {
            const tempState = [...state.itemDrop]
            const updateState = tempState.filter(item => item !== state.itemActive)
            state.itemDrop = [...updateState, action.payload]
            localStorage.setItem('indexItemDropActive', JSON.stringify(state.itemDrop))
            return state
        },
        resetActiveItemDrop: (state) => {
            state.itemDrop = []
            state.itemActive = null
            return state
        } 
    }
})

export const {changDropItem, removeItemDrop, resetActiveItemDrop} = DropSideBarSlice.actions

export default DropSideBarSlice.reducer