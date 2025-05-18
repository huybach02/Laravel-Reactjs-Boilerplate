import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import Loading from "../components/loading";
import { setAuthLogin, setAuthLogout } from "../redux/slices/auth.slice";
import { AuthService } from "../services/AuthService";
import { URL_CONSTANTS } from "../utils/constant";

const AuthMiddleware = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const { isAuthenticated, user } = useSelector(
        (state: RootState) => state.auth
    );

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await AuthService.fetchUser();
                if (userData?.user) {
                    dispatch(
                        setAuthLogin({
                            user: userData.user,
                            isAuthenticated: true,
                        })
                    );
                } else {
                    dispatch(setAuthLogout());
                    navigate(URL_CONSTANTS.LOGIN);
                    return;
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra xác thực:", error);
                dispatch(setAuthLogout());
                navigate(URL_CONSTANTS.LOGIN);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        };

        checkAuth();
    }, [dispatch, navigate]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <>
            {isAuthenticated && user != null ? (
                children
            ) : (
                <Navigate to={URL_CONSTANTS.LOGIN} />
            )}
        </>
    );
};

export default AuthMiddleware;
