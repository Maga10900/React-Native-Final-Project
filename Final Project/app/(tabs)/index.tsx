import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function TabIndex() {
    return (
        <View className="flex-1">
            <Pressable className="px-4 py-2 rounded-lg absolute top-10 z-10" onPress={() => router.push('/onboarding' as any)}>
                <Ionicons name="chevron-back" size={24} color="black" />
            </Pressable>
            
        </View>
    );
}