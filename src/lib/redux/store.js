import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from './auth/authSlice';
import LoadingSlice from './loading/slice';
import DropSideBarSlice from './dropSidebar/dropSidebarSlice';
import WareHouseSlice from './warehouse/wareHouseSlice';
import BatchProductSlice from './batchProduct/BatchProduct';

export const store = configureStore({
    reducer: {
        AuthSlice,
        LoadingSlice,
        DropSideBarSlice,
        WareHouseSlice,
        BatchProductSlice,
    },
});
