import { configureStore } from "@reduxjs/toolkit"
import authStore from "./slices/authSlice"


export const store = configureStore({
    reducer : {
        [authStore.name]: authStore.reducer 
    }
}) 

export type RootState = ReturnType<typeof store.getState>
