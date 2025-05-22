import { createRoot } from "react-dom/client";
import "./index.css";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import UserList from "./pages/user/UserList";
import LoginMiddleware from "./middlewares/LoginMiddleware";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { SnackbarProvider } from "notistack";
import MainLayout from "./components/layouts/main-layout";
import AuthLayout from "./components/layouts/auth-layout";
import { ConfigProvider } from "antd";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/admin" />,
    },
    {
        path: "/admin",
        children: [
            {
                index: true,
                element: (
                    <LoginMiddleware>
                        <AuthLayout title="ĐĂNG NHẬP">
                            <LoginPage />
                        </AuthLayout>
                    </LoginMiddleware>
                ),
            },
            {
                path: "forgot-password",
                element: (
                    <AuthLayout title="QUÊN MẬT KHẨU">
                        <ForgotPassword />
                    </AuthLayout>
                ),
            },
            {
                path: "reset-password",
                element: (
                    <AuthLayout title="ĐẶT LẠI MẬT KHẨU">
                        <ResetPassword />
                    </AuthLayout>
                ),
            },
            {
                path: "dashboard",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                    },
                ],
            },
            {
                path: "user",
                element: <MainLayout />,
                children: [
                    {
                        index: true,
                        element: <UserList />,
                    },
                ],
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <ConfigProvider
        theme={{
            token: {
                // // Seed Token
                // colorPrimary: "#00b96b",
                // borderRadius: 2,
                // // Alias Token
                // colorBgContainer: "#fafafa",
            },
        }}
    >
        <SnackbarProvider
            anchorOrigin={{
                vertical: "top",
                horizontal: "center",
            }}
        >
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        </SnackbarProvider>
    </ConfigProvider>
);
