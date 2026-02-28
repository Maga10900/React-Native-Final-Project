import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardTypeOptions, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export type AuthField = {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    isPassword?: boolean;
    isSelect?: boolean;
    onPressSelect?: () => void;
    value: string;
    onChangeText: (text: string) => void;
};

type AuthScreenProps = {
    title: string;
    subtitle: string;
    fields: AuthField[];
    buttonText: string;
    onButtonPress: () => void;
    showForgotPassword?: boolean;
    footerText: string;
    footerActionText: string;
    onFooterActionPress: () => void;
    onForgotPasswordPress?: () => void;
};

export default function AuthScreen({
    title,
    subtitle,
    fields,
    buttonText,
    onButtonPress,
    showForgotPassword = false,
    footerText,
    footerActionText,
    onFooterActionPress,
    onForgotPasswordPress,
}: AuthScreenProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

    const togglePassword = (name: string) => {
        setShowPassword(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <View className="flex-1 bg-white pt-10 px-6">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mb-4"
            >
                <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
            </TouchableOpacity>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text className="text-[32px] font-black text-[#1E1E1E] mb-2">{title}</Text>
                <Text className="text-gray-500 mb-10 text-base">{subtitle}</Text>

                {fields.map((field, index) => {
                    const isLast = index === fields.length - 1;
                    const isPasswordVisible = showPassword[field.name];

                    let containerClass = "mb-6";
                    if (isLast) {
                        containerClass = showForgotPassword ? "mb-2" : "mb-8";
                    }

                    return (
                        <View key={field.name} className={containerClass}>
                            <Text className="text-sm font-bold text-[#1E1E1E] mb-2">{field.label}</Text>
                            <View className="flex-row items-center border border-[#E7E7E7] rounded-xl px-4 py-3 bg-[#FAFAFA]">
                                <Ionicons name={field.icon} size={20} color="#999" />
                                {field.isSelect ? (
                                    <TouchableOpacity className="flex-1 ml-3" onPress={field.onPressSelect}>
                                        <Text className={`text-base ${field.value ? 'text-[#1E1E1E]' : 'text-[#999]'}`}>
                                            {field.value || field.placeholder}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TextInput
                                        className="flex-1 ml-3 text-[#1E1E1E] text-base"
                                        placeholder={field.placeholder}
                                        placeholderTextColor="#999"
                                        keyboardType={field.keyboardType}
                                        autoCapitalize={field.autoCapitalize}
                                        secureTextEntry={field.isPassword && !isPasswordVisible}
                                        value={field.value}
                                        onChangeText={field.onChangeText}
                                    />
                                )}
                                {field.isPassword && !field.isSelect && (
                                    <TouchableOpacity onPress={() => togglePassword(field.name)}>
                                        <Ionicons
                                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#999"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}

                {/* Main Action Button */}
                <TouchableOpacity
                    onPress={onButtonPress}
                    className="bg-[#DFFF00] py-4 rounded-xl items-center shadow-sm"
                >
                    <Text className="text-[#1E1E1E] font-black text-lg">{buttonText}</Text>
                </TouchableOpacity>

                {/* Footer Link */}
                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-500 text-base">{footerText} </Text>
                    <TouchableOpacity onPress={onFooterActionPress}>
                        <Text className="text-[#1E1E1E] font-black text-base underline">{footerActionText}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}