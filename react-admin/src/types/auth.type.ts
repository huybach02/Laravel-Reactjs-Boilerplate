import type { ApiResponseSuccess } from "./index.type";
import type { User } from "./user.type";

export interface LoginForm {
    email: string;
    password: string;
    remember_me: boolean;
}

export interface LoginData {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

export interface ForgotPasswordForm {
    email: string;
}

export interface ResetPasswordForm {
    password: string;
    password_confirmation: string;
    token: string;
}

export type LoginResponse = ApiResponseSuccess<LoginData>;
export type LogoutResponse = ApiResponseSuccess<[]>;
export type ForgotPasswordResponse = ApiResponseSuccess<[]>;
export type ResetPasswordResponse = ApiResponseSuccess<[]>;
