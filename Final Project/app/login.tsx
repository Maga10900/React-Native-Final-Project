import { CommonActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import AuthScreen, { AuthField } from "../components/AuthScreen";
import { loginUser } from "../src/api/auth";
import { setToken } from "../src/storage/token";

export default function Login() {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleLogin = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const response = await loginUser({ email, password });
      console.log(response);
      if (response && response.token) {
        await setToken(response.token);
        // Reset the navigation state so we can't go back to auth flow
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "(tabs)" }],
          }),
        );
      } else {
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
      onChangeText: (text) => {
        setEmail(text);
        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
      },
      error: errors.email,
    },
    {
      name: "password",
      label: "Password",
      icon: "lock-closed-outline",
      placeholder: "Enter your password",
      isPassword: true,
      value: password,
      onChangeText: (text) => {
        setPassword(text);
        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
      },
      error: errors.password,
    },
  ];

  return (
    <AuthScreen
      title="Welcome Back"
      subtitle="Sign in to continue"
      fields={fields}
      buttonText="Log In"
      onButtonPress={handleLogin}
      showForgotPassword={true}
      onForgotPasswordPress={() => router.push("/forgot-password" as any)}
      footerText="Don't have an account?"
      footerActionText="Sign up"
      onFooterActionPress={() => router.push("/register-choice" as any)}
    />
  );
}
