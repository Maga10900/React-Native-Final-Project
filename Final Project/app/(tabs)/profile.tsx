import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { getWorkerProfile, WorkerProfile } from "../../src/api/workerProfile";

interface ProfileItemProps {
    label: string;
    value?: string;
    showAvatar?: boolean;
    avatarUri?: string;
    onPress?: () => void;
}

const ProfileItem = ({ label, value, showAvatar, avatarUri, onPress }: ProfileItemProps) => (
    <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between py-4 px-4 bg-white border-b border-gray-100"
    >
        <Text className="text-base font-bold text-gray-800">{label}</Text>
        <View className="flex-row items-center">
            {showAvatar && (
                <View className="w-12 h-12 bg-gray-200 rounded items-center justify-end overflow-hidden mr-2">
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Ionicons name="person" size={40} color="#A1A1AA" className="mb-[-5]" />
                    )}
                </View>
            )}
            {value && <Text className="text-sm text-gray-500 mr-2">{value}</Text>}
            {onPress && <Ionicons name="chevron-forward" size={20} color="#D4D4D8" />}
        </View>
    </Pressable>
);

export default function ProfileTab() {
    const [profile, setProfile] = useState<WorkerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function fetchProfile() {
                try {
                    setLoading(true);
                    const data = await getWorkerProfile();
                    if (isActive && data) {
                        setProfile(data);
                    }
                } catch (error) {
                    console.error("Failed to load profile", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            }

            fetchProfile();

            return () => {
                isActive = false;
            };
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-row items-center px-4 py-4 bg-white mt-8">
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </Pressable>
                <Text className="text-xl font-bold ml-4">My profile</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2C2C2C" />
                </View>
            ) : (
                <ScrollView className="flex-1 bg-white mt-2">
                    <ProfileItem
                        label="Profile photo"
                        showAvatar
                        avatarUri={profile?.profilePhoto}
                        onPress={() => router.push({ pathname: '/edit-photo', params: { worker: JSON.stringify(profile) } } as any)}
                    />
                    <ProfileItem
                        label="Name"
                        value={profile ? `${profile.firstName} ${profile.lastName}` : "Unknown"}
                        onPress={() => router.push('/edit-profile' as any)}
                    />
                    <ProfileItem
                        label="Email"
                        value={profile?.email || "No email"}
                        onPress={() => router.push('/edit-profile' as any)}
                    />
                    <ProfileItem
                        label="Contact"
                        value={profile?.phoneNumber || "No contact"}
                        onPress={() => router.push('/edit-profile' as any)}
                    />
                    <ProfileItem
                        label="Job"
                        value={profile?.job || "Not specified"}
                    />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
