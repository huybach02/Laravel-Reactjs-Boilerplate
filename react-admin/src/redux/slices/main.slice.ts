import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export interface MainState {
    notification: string;
    isLoading: boolean;
}

const initialState: MainState = {
    notification: "",
    isLoading: false,
};

export const mainSlice = createSlice({
    name: "main",
    initialState,
    reducers: {
        setNotification: (
            state,
            action: PayloadAction<{
                message: string;
                type: "success" | "error" | "info" | "warning";
            }>
        ) => {
            state.notification = action.payload.message;
            if (state.notification) {
                toast[action.payload.type](state.notification);
                state.notification = "";
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setNotification, setLoading } = mainSlice.actions;

export default mainSlice.reducer;
