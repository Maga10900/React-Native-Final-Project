import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { updateWorkerProfile, UpdateWorkerRequest, WorkerProfile } from "../src/api/workerProfile";

export default function EditProfileScreen() {
    const params = useLocalSearchParams();
    const workerParams = params.worker ? JSON.parse(params.worker as string) as WorkerProfile : null;

    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState(workerParams?.firstName || "");
    const [lastName, setLastName] = useState(workerParams?.lastName || "");
    const [phoneNumber, setPhoneNumber] = useState(workerParams?.phoneNumber || "");
    const [age, setAge] = useState(workerParams?.age?.toString() || "");
    const [job, setJob] = useState(workerParams?.job || "");
    const [description, setDescription] = useState(workerParams?.description || "");

    const handleSave = async () => {
        if (!workerParams) {
            Alert.alert("Error", "Missing worker ID");
            return;
        }

        try {
            setLoading(true);
            const requestData: UpdateWorkerRequest = {
                id: workerParams.id,
                firstName,
                lastName,
                phoneNumber,
                age: parseInt(age) || 0,
                job,
                description,
                rating: workerParams.rating || 0,
                profilePhoto: workerParams.profilePhoto
            };

            await updateWorkerProfile(requestData);
            router.back();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 bg-white mt-8 border-b border-gray-100">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </Pressable>
                    <Text className="text-xl font-bold ml-4">Edit Profile</Text>
                </View>
                <Pressable
                    onPress={handleSave}
                    disabled={loading}
                    className={`px-4 py-1.5 rounded ${loading ? 'bg-gray-400' : 'bg-[#2C2C2C]'}`}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text className="font-semibold text-white">Save</Text>
                    )}
                </Pressable>
            </View>

            {/* Form */}
            <ScrollView className="flex-1 bg-white p-4">
                <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">First Name</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">Last Name</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">Phone Number</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">Age</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                        value={age}
                        onChangeText={setAge}
                        placeholder="Age"
                        keyboardType="numeric"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">Description</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800 h-24"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Describe yourself"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
