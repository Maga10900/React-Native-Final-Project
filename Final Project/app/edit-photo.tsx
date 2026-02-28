import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, Text, View } from "react-native";
import { updateWorkerProfile, WorkerProfile } from "../src/api/workerProfile";

export default function EditPhotoScreen() {
    const params = useLocalSearchParams();
    const workerParams = params.worker ? JSON.parse(params.worker as string) as WorkerProfile : null;

    const [hasNewPhoto, setHasNewPhoto] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(workerParams?.profilePhoto || null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
            setBase64Image(result.assets[0].base64 || null);
            setHasNewPhoto(true);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
            setBase64Image(result.assets[0].base64 || null);
            setHasNewPhoto(true);
        }
    };

    const handleSave = async () => {
        if (!workerParams) {
            Alert.alert("Error", "Missing worker data. Please go back and try again.");
            return;
        }

        if (!base64Image) {
            // Unchanged or no new photo selected
            router.back();
            return;
        }

        try {
            setLoading(true);

            // Format for the API (if backend requires data uri prefix, append it, otherwise just base64)
            // Assuming the backend expects pure Base64 or a valid data URI
            const photoData = `data:image/jpeg;base64,${base64Image}`;

            await updateWorkerProfile({
                id: workerParams.id,
                firstName: workerParams.firstName,
                lastName: workerParams.lastName,
                phoneNumber: workerParams.phoneNumber,
                age: workerParams.age,
                job: workerParams.job,
                description: workerParams.description,
                rating: workerParams.rating,
                profilePhoto: photoData
            });

            router.back();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile photo");
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
                    <Text className="text-xl font-bold ml-4">Edit photo</Text>
                </View>
                <Pressable
                    onPress={handleSave}
                    disabled={!hasNewPhoto || loading}
                    className={`px-4 py-1.5 rounded ${(hasNewPhoto && !loading) ? 'bg-[#2C2C2C]' : 'bg-[#D4D4D8]'}`}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text className="font-semibold text-white">Save</Text>
                    )}
                </Pressable>
            </View>

            {/* Body */}
            <View className="flex-1 bg-gray-50 items-center pt-20">
                {/* Photo Area */}
                <View className="w-36 h-36 bg-[#E4E4E7] rounded-xl items-center justify-end overflow-hidden mb-8">
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Ionicons name="person" size={120} color="#A1A1AA" className="mb-[-15]" />
                    )}
                </View>

                {/* Buttons */}
                <Pressable
                    onPress={pickImage}
                    className="flex-row items-center justify-center w-64 py-3 px-4 bg-[#E0E7FF] rounded-lg mb-4"
                >
                    <Ionicons name="image-outline" size={20} color="black" />
                    <Text className="text-sm font-semibold text-gray-800 ml-3">Choose from Gallery</Text>
                </Pressable>

                <Pressable
                    onPress={takePhoto}
                    className="flex-row items-center justify-center w-64 py-3 px-4 bg-[#E0E7FF] rounded-lg"
                >
                    <Ionicons name="camera-outline" size={22} color="black" />
                    <Text className="text-sm font-semibold text-gray-800 ml-3">Take Photo</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
