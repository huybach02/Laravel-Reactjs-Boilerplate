import axios from "../configs/axios";
import type {
    ForgotPasswordForm,
    ForgotPasswordResponse,
    LoginForm,
    LoginResponse,
    LogoutResponse,
    ResetPasswordForm,
    ResetPasswordResponse,
    VerifyOTPForm,
    VerifyOTPResponse,
} from "../types/auth.type";
import { handleAxiosError } from "../helpers/axiosHelper";
import type { UserResponse } from "../types/user.type";
import { toast } from "../utils/toast";
import { API_ROUTE_CONFIG } from "../configs/api-route-config";

export const AuthService = {
    login: async (payload: LoginForm): Promise<LoginResponse | undefined> => {
        try {
            const res: LoginResponse = await axios.post(
                API_ROUTE_CONFIG.LOGIN,
                payload
            );
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
            const res: LogoutResponse = await axios.post(
                API_ROUTE_CONFIG.LOGOUT
            );
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
            const res = await axios.post(API_ROUTE_CONFIG.ME);
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
                API_ROUTE_CONFIG.FORGOT_PASSWORD,
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
                API_ROUTE_CONFIG.RESET_PASSWORD,
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
    verifyOTP: async (
        payload: VerifyOTPForm
    ): Promise<VerifyOTPResponse | undefined> => {
        try {
            const res: VerifyOTPResponse = await axios.post(
                API_ROUTE_CONFIG.VERIFY_OTP,
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
