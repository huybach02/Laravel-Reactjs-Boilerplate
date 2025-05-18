/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useLocation } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../../components/ui/sidebar";
import {
    DATA_CONSTANTS,
    SIDEBAR_ITEMS,
    URL_CONSTANTS,
} from "../../utils/constant";
import { cn } from "../../lib/utils";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

// Định nghĩa types
interface MenuItem {
    title: string;
    url?: string;
    icon: any;
    submenu?: boolean;
    submenuOpen?: boolean;
    children?: MenuItem[];
}

interface ClosingMenusState {
    [key: number]: boolean;
}

// Custom hook để quản lý menu items và submenu
function useSubmenuManager(initialItems: MenuItem[]) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems);
    const [closingMenus, setClosingMenus] = useState<ClosingMenusState>({});
    const timeoutRefs = useRef<{ [key: number]: NodeJS.Timeout }>({});
    const submenuHeights = useRef<{ [key: number]: number }>({});
    const location = useLocation();
    const currentPath = location.pathname;

    // Xử lý đóng/mở submenu
    const toggleSubMenu = (index: number) => {
        const currentItem = menuItems[index];

        if (currentItem.submenuOpen) {
            // Khi đóng menu
            setClosingMenus((prev) => ({ ...prev, [index]: true }));

            if (timeoutRefs.current[index]) {
                clearTimeout(timeoutRefs.current[index]);
            }

            timeoutRefs.current[index] = setTimeout(() => {
                setMenuItems((prev) => {
                    const updated = [...prev];
                    updated[index].submenuOpen = false;
                    return updated;
                });
                setClosingMenus((prev) => ({ ...prev, [index]: false }));
            }, 250);
        } else {
            // Khi mở menu
            const updatedMenuItems = [...menuItems];
            updatedMenuItems[index].submenuOpen = true;
            setMenuItems(updatedMenuItems);
        }
    };

    // Lưu ref chiều cao của submenu
    const setSubmenuRef = (index: number, el: HTMLDivElement | null) => {
        if (el && !closingMenus[index]) {
            submenuHeights.current[index] = el.scrollHeight;
        }
    };

    // Auto-expand menu khi F5 nếu URL trùng với submenu item
    useEffect(() => {
        const updatedMenuItems = [...menuItems];
        let hasChanged = false;

        updatedMenuItems.forEach((item, index) => {
            if (item.submenu && item.children) {
                const hasMatchingChild = item.children.some(
                    (child) => child.url === currentPath
                );

                if (hasMatchingChild && !item.submenuOpen) {
                    updatedMenuItems[index].submenuOpen = true;
                    hasChanged = true;
                }
            }
        });

        if (hasChanged) {
            setMenuItems(updatedMenuItems);
        }
    }, [currentPath]);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach((timeout) => {
                clearTimeout(timeout);
            });
        };
    }, []);

    return {
        menuItems,
        closingMenus,
        currentPath,
        submenuHeights,
        toggleSubMenu,
        setSubmenuRef,
    };
}

// Props cho các components
interface RegularMenuItemProps {
    item: MenuItem;
    isActive: boolean;
}

interface SubMenuItemProps {
    item: MenuItem;
    childIndex: number;
    isActive: boolean;
}

interface CollapseMenuItemProps {
    item: MenuItem;
    isOpen: boolean;
    isClosing: boolean;
    height?: number;
    currentPath: string;
    onToggle: () => void;
    onRef: (el: HTMLDivElement | null) => void;
}

// Component cho menu item thông thường
const RegularMenuItem = ({ item, isActive }: RegularMenuItemProps) => (
    <SidebarMenuItem>
        <SidebarMenuButton
            asChild
            className={cn(
                "p-2 font-semibold hover:bg-neutral-200",
                isActive &&
                    "bg-primary text-white hover:bg-primary hover:text-white"
            )}
        >
            <Link to={item.url || "#"}>
                <item.icon size={18} />
                <span>{item.title}</span>
            </Link>
        </SidebarMenuButton>
    </SidebarMenuItem>
);

// Component cho submenu item
const SubMenuItem = ({ item, childIndex, isActive }: SubMenuItemProps) => (
    <SidebarMenuItem
        key={item.title}
        className={cn("submenu-item", "opacity-100 translate-x-0")}
        style={{
            transitionDelay: `${childIndex * 40}ms`,
            transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
    >
        <SidebarMenuButton
            asChild
            className={cn(
                "p-2 font-semibold hover:bg-neutral-200",
                isActive &&
                    "bg-primary text-white hover:bg-primary hover:text-white"
            )}
        >
            <Link to={item.url || "#"}>
                <item.icon size={16} />
                <span>{item.title}</span>
            </Link>
        </SidebarMenuButton>
    </SidebarMenuItem>
);

// Component cho menu với submenu
const CollapseMenuItem = ({
    item,
    isOpen,
    isClosing,
    height,
    currentPath,
    onToggle,
    onRef,
}: CollapseMenuItemProps) => (
    <>
        <SidebarMenuItem>
            <button
                onClick={onToggle}
                className={cn(
                    "flex items-center w-full p-2 font-semibold hover:bg-neutral-200 transition-all",
                    isOpen && "bg-neutral-100"
                )}
            >
                <span className="flex items-center gap-2">
                    <item.icon
                        size={18}
                        className="transition-transform duration-200"
                    />
                    <span>{item.title}</span>
                </span>
                <span className="ml-auto">
                    <ChevronDown
                        size={16}
                        className={cn(
                            "transition-transform duration-200",
                            !isOpen && "rotate-[-90deg]"
                        )}
                    />
                </span>
            </button>
        </SidebarMenuItem>

        <div
            ref={onRef}
            className={cn(
                "submenu-wrapper overflow-hidden transition-all duration-250 ease-in-out",
                !isOpen && !isClosing && "h-0 opacity-0"
            )}
            style={{
                height: isClosing
                    ? "0px"
                    : isOpen
                    ? `${height || "auto"}px`
                    : "0px",
                opacity: isClosing ? 0 : 1,
            }}
        >
            <div className="pl-4 border-l border-neutral-200 ml-3 my-1">
                {item.children &&
                    item.children.map((child, childIndex) => (
                        <SubMenuItem
                            key={child.title}
                            item={child}
                            childIndex={childIndex}
                            isActive={currentPath === child.url}
                        />
                    ))}
            </div>
        </div>
    </>
);

// Component chính cho Sidebar
export function AppSidebar() {
    const {
        menuItems,
        closingMenus,
        currentPath,
        submenuHeights,
        toggleSubMenu,
        setSubmenuRef,
    } = useSubmenuManager(SIDEBAR_ITEMS);

    return (
        <Sidebar className="sidebar">
            <SidebarContent>
                <SidebarGroup>
                    {/* Header */}
                    <SidebarHeader>
                        <Link to={URL_CONSTANTS.DASHBOARD}>
                            <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight bg-gradient-to-r drop-shadow-sm uppercase text-primary">
                                {DATA_CONSTANTS.WEBSITE_NAME}
                            </h1>
                        </Link>
                        <h3 className="text-md font-semibold text-center pb-5 border-b text-zinc-600 dark:text-zinc-400 tracking-wide">
                            <span className="inline-block px-4 py-1 rounded bg-primary text-white border-zinc-200 shadow-md">
                                {DATA_CONSTANTS.PANEL_NAME}
                            </span>
                        </h3>
                    </SidebarHeader>

                    {/* Menu items */}
                    <SidebarGroupContent className="mt-3 mb-10">
                        <SidebarMenu>
                            {menuItems.map((item, index) => (
                                <div
                                    key={item.title}
                                    className="submenu-transition-wrapper"
                                >
                                    {item.submenu ? (
                                        <CollapseMenuItem
                                            item={item}
                                            isOpen={item.submenuOpen || false}
                                            isClosing={
                                                closingMenus[index] || false
                                            }
                                            height={
                                                submenuHeights.current[index]
                                            }
                                            currentPath={currentPath}
                                            onToggle={() =>
                                                toggleSubMenu(index)
                                            }
                                            onRef={(el) =>
                                                setSubmenuRef(index, el)
                                            }
                                        />
                                    ) : (
                                        <RegularMenuItem
                                            item={item}
                                            isActive={currentPath === item.url}
                                        />
                                    )}
                                </div>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
