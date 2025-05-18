import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { ForgotPasswordForm } from "../types/auth.type";
import { useForm } from "react-hook-form";
import { AuthService } from "../services/AuthService";
import { setLoading } from "../redux/slices/main.slice";
import { DATA_CONSTANTS, URL_CONSTANTS } from "../utils/constant";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading } = useSelector((state: RootState) => state.main);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>();

    const onSubmit = async (data: ForgotPasswordForm) => {
        dispatch(setLoading(true));
        await AuthService.forgotPassword(data);
        dispatch(setLoading(false));
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
                    Quên mật khẩu
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
                        <div>
                            <Button
                                className="w-full mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang gửi..." : "Gửi"}
                            </Button>
                            <Button
                                className="w-full mt-4"
                                variant="ghost"
                                disabled={isLoading}
                                onClick={() => navigate(URL_CONSTANTS.LOGIN)}
                            >
                                Quay lại đăng nhập
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
