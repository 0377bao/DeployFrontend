import {createSlice} from '@reduxjs/toolkit'

export const AuthSlice = createSlice({
    name: 'authSlice',
    initialState: {
        user: {
            name: 'Van Teo'
        }
    },
    reducers: {
        login: (state, action) => {
            state.user = {...action.payload}
            return state
        },
        logout: (state) => {
            state.user = null;
            return state
        }
    }
})

export const {login, logout} = AuthSlice.actions

export default AuthSlice.reducer
