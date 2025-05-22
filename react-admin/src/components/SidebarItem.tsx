import React from "react";
import { DashboardOutlined, UserOutlined } from "@ant-design/icons";
import { URL_CONSTANTS } from "../utils/constant";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarItem = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Xác định menu item nào đang active dựa trên đường dẫn hiện tại
    const getSelectedKey = () => {
        const path = location.pathname;

        // Tạo map giữa path và key
        const pathToKeyMap = Object.values(URL_CONSTANTS).reduce((acc, url) => {
            // Bỏ qua các URL không thuộc admin hoặc không phải là path chính
            if (typeof url === "string" && url.startsWith("/admin/")) {
                const key = url.split("/admin/")[1]; // Lấy phần sau '/admin/'
                acc[key] = key;
            }
            return acc;
        }, {} as Record<string, string>);

        // Tìm key phù hợp với path hiện tại
        const currentPath = path.replace("/admin/", "");
        const matchedKey = Object.keys(pathToKeyMap).find(
            (key) => currentPath === key || currentPath.startsWith(`${key}/`)
        );

        return matchedKey || "dashboard"; // Mặc định là dashboard nếu không tìm thấy
    };

    const iconStyle = {
        fontSize: "18px",
    };

    const items = [
        {
            key: "dashboard",
            label: "Thống kê",
            icon: React.createElement(DashboardOutlined, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.DASHBOARD),
            className:
                getSelectedKey() === "dashboard"
                    ? "ant-menu-item-selected"
                    : "",
        },
        {
            key: "user",
            label: "Quản lý người dùng",
            icon: React.createElement(UserOutlined, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.USER),
            className:
                getSelectedKey() === "user" ? "ant-menu-item-selected" : "",
        },

        // Custom submenu
        // {
        //     key: "test",
        //     label: "Test",
        //     icon: React.createElement(UserOutlined, { style: iconStyle }),
        //     onClick: () => navigate(URL_CONSTANTS.USER),
        //     children: [
        //         {
        //             key: "test-1",
        //             label: "Test 1",
        //             icon: React.createElement(UserOutlined, {
        //                 style: iconStyle,
        //             }),
        //         },
        //     ],
        // },
    ];

    return items;
};

export default SidebarItem;
