import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import AppNavbar from "./app-navbar";
import AuthMiddleware from "../../middlewares/AuthMiddleware";

const Layout = () => {
    return (
        <AuthMiddleware>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                    <AppNavbar />
                    <div className="p-3">
                        <Outlet />
                    </div>
                </main>
            </SidebarProvider>
        </AuthMiddleware>
    );
};

export default Layout;
