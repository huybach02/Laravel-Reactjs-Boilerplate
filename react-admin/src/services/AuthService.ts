import { toast } from "react-toastify";
import axios from "../configs/axios";
import type { LoginForm, LoginResponse } from "../types/login.type";
import { handleAxiosError } from "../helpers/axiosHelper";

export const AuthService = {
    login: async (payload: LoginForm): Promise<LoginResponse | undefined> => {
        try {
            const res: LoginResponse = await axios.post("/auth/login", payload);
            toast.success(res.message);
            return res;
        } catch (error) {
            handleAxiosError(error);
        }
    },
};
