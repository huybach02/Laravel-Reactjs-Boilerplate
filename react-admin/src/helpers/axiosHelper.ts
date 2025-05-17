import axios from "../configs/axios";
import { toast } from "react-toastify";

export const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        console.error("Login error:", error.response?.data);
        toast.error(error.response?.data?.message || "Something went wrong");
    } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
    }
};
