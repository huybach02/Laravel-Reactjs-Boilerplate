import type { ApiResponseSuccess } from "./index.type";

export interface LoginForm {
    email: string;
    password: string;
    remember_me: boolean;
}

export interface LoginData {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
        updated_at: string;
    };
}

export type LoginResponse = ApiResponseSuccess<LoginData>;
