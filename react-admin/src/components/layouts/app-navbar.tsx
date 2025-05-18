import { Bell, LogOut, MessageCircle, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarTrigger } from "../ui/sidebar";
import { AuthService } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import { URL_CONSTANTS } from "../../utils/constant";
import { setAuthLogout } from "../../redux/slices/auth.slice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Button } from "../ui/button";

const AppNavbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        await AuthService.logout();
        dispatch(setAuthLogout());
        navigate(URL_CONSTANTS.LOGIN);
    };

    return (
        <div className="w-full flex items-center justify-between py-4 px-5 border-b bg-white shadow-sm">
            <SidebarTrigger />
            <div className="flex items-center gap-5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Bell />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60">
                        <h1 className="text-lg font-medium text-center my-2">
                            Thông báo
                        </h1>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <MessageCircle />
                            Thông báo 1
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                            <MessageCircle />
                            Thông báo 2
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <p className="text-center">Tất cả thông báo</p>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar className="border">
                                <AvatarImage
                                    src={
                                        user?.image ||
                                        "https://github.com/shadcn.png"
                                    }
                                    alt="@shadcn"
                                />
                                <AvatarFallback>
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium">
                                Xin chào, {user?.name}
                            </p>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                        <DropdownMenuItem>
                            <User />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="text-red-500" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default AppNavbar;
