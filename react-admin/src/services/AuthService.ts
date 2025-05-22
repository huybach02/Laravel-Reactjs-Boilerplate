import axios from "../configs/axios";
import type {
    ForgotPasswordForm,
    ForgotPasswordResponse,
    LoginForm,
    LoginResponse,
    LogoutResponse,
    ResetPasswordForm,
    ResetPasswordResponse,
} from "../types/auth.type";
import { handleAxiosError } from "../helpers/axiosHelper";
import type { UserResponse } from "../types/user.type";
import { toast } from "../utils/toast";

export const AuthService = {
    login: async (payload: LoginForm): Promise<LoginResponse | undefined> => {
        try {
            const res: LoginResponse = await axios.post("/auth/login", payload);
            if (res.success) {
                toast.success(res.message);
                localStorage.setItem("token", res.data.access_token);
                return res;
            }
        } catch (error) {
            handleAxiosError(error);
        }
    },
    logout: async (): Promise<LogoutResponse | undefined> => {
        try {
            const res: LogoutResponse = await axios.post("/auth/logout");
            if (res.success) {
                toast.success(res.message);
                localStorage.removeItem("token");
                return res;
            }
        } catch (error) {
            handleAxiosError(error);
        }
    },
    fetchUser: async (): Promise<UserResponse | undefined> => {
        try {
            const res = await axios.post("/auth/me");
            return res.data;
        } catch (error) {
            handleAxiosError(error);
        }
    },
    forgotPassword: async (
        payload: ForgotPasswordForm
    ): Promise<ForgotPasswordResponse | undefined> => {
        try {
            const res: ForgotPasswordResponse = await axios.post(
                "/auth/forgot-password",
                payload
            );
            if (res.success) {
                toast.success(res.message);
                return res;
            }
        } catch (error) {
            handleAxiosError(error);
        }
    },
    resetPassword: async (
        payload: ResetPasswordForm
    ): Promise<ResetPasswordResponse | undefined> => {
        try {
            const res: ResetPasswordResponse = await axios.post(
                "/auth/reset-password",
                payload
            );
            if (res.success) {
                toast.success(res.message);
                return res;
            }
        } catch (error) {
            handleAxiosError(error);
        }
    },
};
