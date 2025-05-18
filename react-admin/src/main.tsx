import { createRoot } from "react-dom/client";
import "./index.css";
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import UserList from "./pages/user/UserList";
import Layout from "./components/layouts/layout";
import LoginMiddleware from "./middlewares/LoginMiddleware";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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
                        <LoginPage />
                    </LoginMiddleware>
                ),
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: "reset-password",
                element: <ResetPassword />,
            },
            {
                path: "dashboard",
                element: <Layout />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                    },
                ],
            },
            {
                path: "user",
                element: <Layout />,
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
    // <StrictMode>
    <Provider store={store}>
        <RouterProvider router={router} />
        <ToastContainer position="top-center" />
    </Provider>
    // </StrictMode>
);
