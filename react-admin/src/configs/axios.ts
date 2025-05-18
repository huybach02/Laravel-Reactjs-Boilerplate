/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { URL_CONSTANTS } from "../utils/constant";

let isRefreshing = false;
let failedQueue: any[] = [];
let isRedirecting = false;

const processQueue = (error: any) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

axios.interceptors.response.use(
    (response) => {
        return response.data ? response.data : response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response.status === 401 &&
            error.response.data.error_code === "TOKEN_EXPIRED"
            // && !originalRequest._retry
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return axios(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi API để làm mới token
                await axios.get("/auth/refresh", { withCredentials: true });

                // Token mới đã được tự động đặt vào cookie bởi server
                const response = await axios(originalRequest);
                processQueue(null);
                return response;
            } catch (refreshError) {
                processQueue(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (
            error.response.status === 401 &&
            error.response.data.error_code !== "TOKEN_EXPIRED" &&
            !isRedirecting
        ) {
            isRedirecting = true;
            if (window.location.pathname !== URL_CONSTANTS.LOGIN) {
                window.location.href = URL_CONSTANTS.LOGIN;
                localStorage.removeItem("token");
            }
        }
        return Promise.reject(error);
    }
);

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://hometify.test/api/";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["Accept"] = "application/json";
// axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

export default axios;
