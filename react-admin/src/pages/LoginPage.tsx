import { Button, Checkbox, Flex, Form, Input } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import { URL_CONSTANTS } from "../utils/constant";
import { setLoading } from "../redux/slices/main.slice";
import { AuthService } from "../services/AuthService";
import type { LoginForm } from "../types/auth.type";

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { isLoading } = useSelector((state: RootState) => state.main);

    const onFinish = async (values: LoginForm) => {
        dispatch(setLoading(true));
        const response = await AuthService.login(values);
        dispatch(setLoading(false));

        if (response?.success) {
            if (response?.data?.is_2fa) {
                navigate(URL_CONSTANTS.VERIFY_OTP);
                localStorage.setItem("user_id", response?.data?.user_id || "");
            } else {
                navigate(URL_CONSTANTS.DASHBOARD);
            }
        }
    };

    return (
        <Form
            name="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
        >
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                ]}
            >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                    },
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu"
                />
            </Form.Item>

            <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ tôi</Checkbox>
                </Form.Item>
                <a href={URL_CONSTANTS.FORGOT_PASSWORD}>Quên mật khẩu?</a>
            </Flex>

            <Form.Item style={{ marginTop: 24 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={isLoading}
                >
                    Đăng nhập
                </Button>
            </Form.Item>
        </Form>
    );
};

export default LoginPage;
