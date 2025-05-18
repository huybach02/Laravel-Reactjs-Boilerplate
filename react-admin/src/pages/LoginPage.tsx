import { useForm } from "react-hook-form";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { LoginForm } from "../types/auth.type";
import { AuthService } from "../services/AuthService";
import { Link, useNavigate } from "react-router-dom";
import { DATA_CONSTANTS, URL_CONSTANTS } from "../utils/constant";
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
            navigate(URL_CONSTANTS.DASHBOARD);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-extrabold text-center mb-4 tracking-tight bg-gradient-to-r drop-shadow-sm uppercase text-primary">
                    {DATA_CONSTANTS.WEBSITE_NAME}
                </h1>
                <h3 className="text-md font-semibold text-center pb-5 border-b text-zinc-600 dark:text-zinc-400 tracking-wide">
                    <span className="inline-block px-4 py-1 rounded bg-primary text-white border-zinc-200 shadow-md">
                        {DATA_CONSTANTS.PANEL_NAME}
                    </span>
                </h3>
                <p className="text-xl font-semibold text-center my-6">
                    Đăng nhập
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
                                    required: "Email là bắt buộc",
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
                                    required: "Mật khẩu là bắt buộc",
                                })}
                            />
                            {errors.password && (
                                <span className="text-red-500 text-sm">
                                    {errors.password.message}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
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
                            <Link
                                to={URL_CONSTANTS.FORGOT_PASSWORD}
                                className="text-sm text-gray-500"
                            >
                                Quên mật khẩu?
                            </Link>
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
