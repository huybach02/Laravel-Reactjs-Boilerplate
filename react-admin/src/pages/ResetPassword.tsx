import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { ResetPasswordForm } from "../types/auth.type";
import { useForm } from "react-hook-form";
import { AuthService } from "../services/AuthService";
import { setLoading } from "../redux/slices/main.slice";
import { DATA_CONSTANTS, URL_CONSTANTS } from "../utils/constant";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const { isLoading } = useSelector((state: RootState) => state.main);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<ResetPasswordForm>();

    const onSubmit = async (data: ResetPasswordForm) => {
        dispatch(setLoading(true));
        const response = await AuthService.resetPassword({
            ...data,
            token: token as string,
        });
        dispatch(setLoading(false));

        if (response?.success) {
            navigate(URL_CONSTANTS.LOGIN);
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
                    Đặt lại mật khẩu
                </p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="email">Nhập mật khẩu mới</Label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="Mật khẩu"
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
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="password_confirmation">
                                Nhập lại mật khẩu
                            </Label>
                            <Input
                                type="password"
                                id="password_confirmation"
                                placeholder="Nhập lại mật khẩu"
                                {...register("password_confirmation", {
                                    required: "Mật khẩu là bắt buộc",
                                    validate: (value) => {
                                        if (value !== getValues("password")) {
                                            return "Mật khẩu nhập lại không khớp";
                                        }
                                    },
                                })}
                            />
                            {errors.password_confirmation && (
                                <span className="text-red-500 text-sm">
                                    {errors.password_confirmation.message}
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
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
