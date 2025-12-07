import {createSlice} from "@reduxjs/toolkit"

export const WareHouseSlice = createSlice({
    name: 'WareHouseSlice',
    initialState: {
        warehouse: null
    },
    reducers: {
        addInfo: (state, action) => {
            state.warehouse = action.payload
        }
    }
})

export const {addInfo} = WareHouseSlice.actions

export default WareHouseSlice.reducer;
