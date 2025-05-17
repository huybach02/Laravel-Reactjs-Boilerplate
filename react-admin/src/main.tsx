import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./redux/store";
const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />,
    },
    {
        path: "/dashboard",
        element: <DashboardPage />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
            <ToastContainer />
        </Provider>
    </StrictMode>
);
