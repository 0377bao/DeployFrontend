import { createSlice } from '@reduxjs/toolkit';

export const BatchProductSlice = createSlice({
    name: 'BatchProduct',
    initialState: {
        batchProductList: {},
        batchBoxProductList: {},
    },
    reducers: {
        addBatchProductList: (state, action) => {
            const { key, value } = action.payload;
            state.batchProductList[key] = value;
            return state;
        },
        removeBatchProductList: (state, action) => {
            const { key } = action.payload;
            if (!state.batchProductList[key]) return;
            delete state.batchProductList[key];
        },
        clearAllBatchProductList: (state) => {
            state.batchProductList = {};
            state.batchBoxProductList = {};
            return state;
        },
        removeItemInBatchProductList: (state, action) => {
            const { key, batchID } = action.payload;
            if (!state.batchProductList[key]) return;
            const updatedList = state.batchProductList[key].filter((item) => item.batchID !== batchID);
            delete state.batchBoxProductList[`${key}-${batchID}`];
            state.batchProductList[key] = updatedList;
        },
        addLocationInBatchProductList: (state, action) => {
            const { key, batchID, newLocation } = action.payload;
            const composeKey = `${key}-${batchID}`;
            if (!key || !batchID || !newLocation) return;
            state.batchBoxProductList[composeKey] = newLocation;
        },
        getLocationInBatchProductList: (state, action) => {
            const { key, batchID } = action.payload;
            const composeKey = `${key}-${batchID}`;
            return state.batchBoxProductList[composeKey] || [];
        },
    },
});

export const {
    addBatchProductList,
    removeBatchProductList,
    clearAllBatchProductList,
    removeItemInBatchProductList,
    addLocationInBatchProductList,
    getLocationInBatchProductList,
} = BatchProductSlice.actions;

export default BatchProductSlice.reducer;
