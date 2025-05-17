import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { LoginForm } from "../types/login.type";
import { AuthService } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { DATA_CONSTANTS } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setLoading } from "../redux/slices/main.slice";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isLoading } = useSelector((state: RootState) => state.main);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        dispatch(setLoading(true));
        const response = await AuthService.login(data);
        dispatch(setLoading(false));

        if (response?.success) {
            navigate("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight bg-gradient-to-r from-black to-zinc-700 bg-clip-text text-transparent drop-shadow-sm uppercase">
                    {DATA_CONSTANTS.WEBSITE_NAME}
                </h1>
                <h3 className="text-lg font-semibold text-center mb-2 text-zinc-600 dark:text-zinc-400 tracking-wide">
                    <span className="inline-block px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        {DATA_CONSTANTS.PANEL_NAME}
                    </span>
                </h3>
                <p className="text-base text-center mb-6 text-zinc-500 dark:text-zinc-400 italic">
                    Đăng nhập để tiếp tục
                </p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="Email"
                                {...register("email", {
                                    required: "Email is required",
                                })}
                            />
                            {errors.email && (
                                <span className="text-red-500 text-sm">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="Password"
                                {...register("password", {
                                    required: "Password is required",
                                })}
                            />
                            {errors.password && (
                                <span className="text-red-500 text-sm">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Input
                                type="checkbox"
                                id="remember_me"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                {...register("remember_me")}
                            />
                            <Label
                                htmlFor="remember_me"
                                className="text-sm font-medium text-gray-700"
                            >
                                Ghi nhớ đăng nhập
                            </Label>
                        </div>
                        <div>
                            <Button
                                className="w-full mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
