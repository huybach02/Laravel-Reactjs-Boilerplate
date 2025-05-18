import { LayoutDashboard, Users } from "lucide-react";

export const URL_CONSTANTS = {
    LOGIN: "/admin",
    DASHBOARD: "/admin/dashboard",
    USER: "/admin/user",
    FORGOT_PASSWORD: "/admin/forgot-password",
};

export const DATA_CONSTANTS = {
    WEBSITE_NAME: "BOILERPLATE",
    PANEL_NAME: "Trang quản trị",
};

export const SIDEBAR_ITEMS = [
    {
        title: "Thống kê",
        url: URL_CONSTANTS.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: "Quản lý người dùng",
        url: URL_CONSTANTS.USER,
        icon: Users,
    },

    // Custom menu
    // {
    //     title: "Menu",
    //     icon: Menu,
    //     submenu: true,
    //     submenuOpen: false,
    //     children: [
    //         {
    //             title: "Menu 1",
    //             url: "#/menu1",
    //             icon: Menu,
    //         },
    //         {
    //             title: "Menu 2",
    //             url: "#/menu2",
    //             icon: Menu,
    //         },
    //     ],
    // },
];
