import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import AuthScreen, { AuthField } from "../components/AuthScreen";
import { loginUser, registerUser } from "../src/api/auth";
import { setToken } from "../src/storage/token";

export default function Register() {
  const router = useRouter();
  const navigation = useNavigation();
  const { role } = useLocalSearchParams();
  const isWorker = role === "worker";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [job, setJob] = useState("");
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const jobOptions = [
    { label: "Plumber", icon: "🛠️" },
    { label: "Cleaning", icon: "🧹" },
    { label: "Carpenter", icon: "🪚" },
    { label: "Electrician", icon: "👷‍♂️" },
  ];

  const handleRegister = async () => {
    const newErrors: { [key: string]: string } = {};
    const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s\-']+$/;

    if (!firstName) newErrors.firstName = "First name is required";
    else if (!nameRegex.test(firstName))
      newErrors.firstName = "Name should not contain numbers";

    if (!lastName) newErrors.lastName = "Last name is required";
    else if (!nameRegex.test(lastName))
      newErrors.lastName = "Name should not contain numbers";

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!age) newErrors.age = "Age is required";
    if (isWorker && !job) newErrors.job = "Please select a work type";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await registerUser({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        age: parseInt(age, 10) || 0,
        userType: isWorker ? 4 : 5,
        job: isWorker ? job || undefined : undefined,
      });
      // Auto-login after successful registration
      const loginResp = await loginUser({ email, password });
      if (loginResp && loginResp.token) {
        await setToken(loginResp.token);
        // Reset the stack so they can't go back to auth screens
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "(tabs)" }],
          }),
        );
      } else {
        // If login fails for some reason, send them to login screen
        router.replace("/login" as any);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Error", "Registration failed. Please try again.");
    }
  };

  const baseFields: AuthField[] = [
    {
      name: "firstName",
      label: "First Name",
      icon: "person-outline",
      placeholder: "Enter your first name",
      value: firstName,
      onChangeText: (text) => {
        setFirstName(text);
        if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
      },
      error: errors.firstName,
    },
    {
      name: "lastName",
      label: "Last Name",
      icon: "person-outline",
      placeholder: "Enter your last name",
      value: lastName,
      onChangeText: (text) => {
        setLastName(text);
        if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
      },
      error: errors.lastName,
    },
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
      placeholder: "Create a password",
      isPassword: true,
      value: password,
      onChangeText: (text) => {
        setPassword(text);
        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
      },
      error: errors.password,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      icon: "lock-closed-outline",
      placeholder: "Confirm your password",
      isPassword: true,
      value: confirmPassword,
      onChangeText: (text) => {
        setConfirmPassword(text);
        if (errors.confirmPassword)
          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      },
      error: errors.confirmPassword,
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      icon: "call-outline",
      placeholder: "Enter your phone number",
      keyboardType: "phone-pad",
      value: phoneNumber,
      onChangeText: (text) => {
        setPhoneNumber(text);
        if (errors.phoneNumber)
          setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      },
      error: errors.phoneNumber,
    },
    {
      name: "age",
      label: "Age",
      icon: "calendar-outline",
      placeholder: "Enter your age",
      keyboardType: "numeric",
      value: age,
      onChangeText: (text) => {
        setAge(text);
        if (errors.age) setErrors((prev) => ({ ...prev, age: "" }));
      },
      error: errors.age,
    },
  ];

  const fields: AuthField[] = isWorker
    ? [
        ...baseFields,
        {
          name: "job",
          label: "Work Type",
          icon: "briefcase-outline",
          placeholder: "Select your work type",
          value: job,
          onChangeText: () => {},
          isSelect: true,
          onPressSelect: () => {
            setJobModalVisible(true);
            if (errors.job) setErrors((prev) => ({ ...prev, job: "" }));
          },
          error: errors.job,
        },
      ]
    : baseFields;

  return (
    <>
      <AuthScreen
        title="Create Account"
        subtitle="Sign up to get started"
        fields={fields}
        buttonText="Sign Up"
        onButtonPress={handleRegister}
        showForgotPassword={false}
        footerText="Already have an account?"
        footerActionText="Log in"
        onFooterActionPress={() => router.push("/login" as any)}
      />

      <Modal
        visible={jobModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setJobModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-[85%] rounded-[24px] overflow-hidden pb-6">
            <Text className="text-xl font-bold text-center text-[#1E1E1E] my-6">
              Select work type
            </Text>
            <View className="w-full">
              {jobOptions.map((option, index) => {
                const isSelected = job === option.label;
                return (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => setJob(option.label)}
                    className={`flex-row items-center justify-between py-4 px-6 ${index !== jobOptions.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-4">{option.icon}</Text>
                      <Text className="text-base font-medium text-[#1E1E1E]">
                        {option.label}
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={isSelected ? "#374151" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => setJobModalVisible(false)}
              className="bg-[#2C2C2C] mx-6 mt-8 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
