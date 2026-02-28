import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function RegisterChoice() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-10">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mb-8"
                >
                    <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
                </TouchableOpacity>

                {/* Header */}
                <View className="mb-12">
                    <Text className="text-3xl font-bold text-[#1E1E1E] mb-2 text-center">Join Your Services</Text>
                    <Text className="text-base text-gray-500 text-center">How do you want to use the platform?</Text>
                </View>

                {/* Choices */}
                <View className="flex-1 justify-center space-y-6">
                    {/* Be a Worker */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/register', params: { role: 'worker' } } as any)}
                        className="bg-white border-2 border-[#DFFF00] p-6 rounded-[24px] shadow-sm items-center"
                    >
                        <View className="w-16 h-16 bg-[#DFFF00]/20 rounded-full items-center justify-center mb-4">
                            <Ionicons name="construct-outline" size={32} color="#1E1E1E" />
                        </View>
                        <Text className="text-xl font-bold text-[#1E1E1E] mb-2">Be a Worker</Text>
                        <Text className="text-sm text-gray-500 text-center">Start earning by providing your professional services.</Text>
                    </TouchableOpacity>

                    <View className="h-4" />

                    {/* Book a Worker */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/register', params: { role: 'client' } } as any)}
                        className="bg-[#2C2C2C] p-6 rounded-[24px] shadow-lg items-center"
                    >
                        <View className="w-16 h-16 bg-white/10 rounded-full items-center justify-center mb-4">
                            <Ionicons name="search-outline" size={32} color="#DFFF00" />
                        </View>
                        <Text className="text-xl font-bold text-white mb-2">Book a Worker</Text>
                        <Text className="text-sm text-gray-400 text-center">Find the best professionals for your home needs.</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="py-8 items-center">
                    <TouchableOpacity onPress={() => router.push('/login' as any)}>
                        <Text className="text-gray-500">
                            Already have an account? <Text className="text-[#1E1E1E] font-bold">Log in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
