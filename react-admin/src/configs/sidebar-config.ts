import type { NavigateFunction } from "react-router-dom";
import { URL_CONSTANTS } from "../utils/constant";
import {
    AppstoreOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
    SettingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import React from "react";

const iconStyle = {
    fontSize: "18px",
};

export const sidebarConfig = (navigate: NavigateFunction) => {
    return [
        {
            key: "dashboard",
            label: "Thống kê",
            icon: React.createElement(DashboardOutlined, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.DASHBOARD),
        },
        {
            key: "user",
            label: "Quản lý người dùng",
            icon: React.createElement(UserOutlined, { style: iconStyle }),
            onClick: () => navigate(URL_CONSTANTS.USER),
        },
        {
            key: "thiet-lap-he-thong",
            label: "Thiết lập hệ thống",
            icon: React.createElement(SettingOutlined, { style: iconStyle }),
            children: [
                {
                    key: "cau-hinh-chung",
                    label: "Cấu hình chung",
                    icon: React.createElement(AppstoreOutlined, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.CAU_HINH_CHUNG),
                },
                {
                    key: "thoi-gian-lam-viec",
                    label: "Thời gian làm việc",
                    icon: React.createElement(ClockCircleOutlined, {
                        style: iconStyle,
                    }),
                    onClick: () => navigate(URL_CONSTANTS.THOI_GIAN_LAM_VIEC),
                },
            ],
        },
    ];
};
