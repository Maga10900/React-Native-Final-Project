import { useRouter } from "expo-router";
import { useState } from "react";
import AuthScreen, { AuthField } from "../components/AuthScreen";
import { loginUser } from "../src/api/auth";
import { setToken } from "../src/storage/token";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email, password });
            console.log(response);
            if (response && response.token) {
                await setToken(response.token);
                router.push('/(tabs)' as any);
            }
            else {
                alert("Invalid email or password");
            }
        } catch (error: any) {
            alert(error.message || "Invalid email or password");
        }
    };

    const fields: AuthField[] = [
        {
            name: "email",
            label: "Email Address",
            icon: "mail-outline",
            placeholder: "Enter your email",
            keyboardType: "email-address",
            autoCapitalize: "none",
            value: email,
            onChangeText: setEmail,
        },
        {
            name: "password",
            label: "Password",
            icon: "lock-closed-outline",
            placeholder: "Enter your password",
            isPassword: true,
            value: password,
            onChangeText: setPassword,
        }
    ];

    return (
        <AuthScreen
            title="Welcome Back"
            subtitle="Sign in to continue"
            fields={fields}
            buttonText="Log In"
            onButtonPress={handleLogin}
            showForgotPassword={true}
            onForgotPasswordPress={() => router.push('/forgot-password' as any)}
            footerText="Don't have an account?"
            footerActionText="Sign up"
            onFooterActionPress={() => router.push('/register' as any)}
        />
    );
}
