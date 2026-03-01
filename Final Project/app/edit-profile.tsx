import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    getWorkerProfile,
    updateWorkerProfile,
    UpdateWorkerRequest,
} from "../src/api/workerProfile";

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Original profile tracking
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(
    undefined,
  );
  const [rating, setRating] = useState<number>(0);

  // User editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [job, setJob] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profile = await getWorkerProfile();
        if (profile) {
          setWorkerId(profile.id);
          setProfilePhoto(profile.profilePhoto);
          setRating(profile.rating);
          setFirstName(profile.firstName || "");
          setLastName(profile.lastName || "");
          setPhoneNumber(profile.phoneNumber || "");
          setEmail(profile.email || "");
          setAge(profile.age ? profile.age.toString() : "");
          setJob(profile.job || "");
          setDescription(profile.description || "");
        }
      } catch (error: any) {
        console.error("Failed to load profile parameters", error);
        Alert.alert("Error", error?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!workerId) {
      Alert.alert("Error", "Missing worker ID");
      return;
    }

    try {
      setSaving(true);
      const requestData: UpdateWorkerRequest = {
        id: workerId,
        firstName,
        lastName,
        email,
        phoneNumber,
        age: parseInt(age) || 0,
        job,
        description,
        rating,
        profilePhoto,
      };

      await updateWorkerProfile(requestData);
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white mt-8 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={24} color="#1E1E1E" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Edit Profile</Text>
        </View>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`px-4 py-1.5 rounded ${saving ? "bg-gray-400" : "bg-[#2C2C2C]"}`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="font-semibold text-white">Save</Text>
          )}
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#2C2C2C" />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-white p-4">
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">
              First Name
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">
              Last Name
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">
              Email
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">
              Phone Number
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">
              Age
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              keyboardType="numeric"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1 ml-1 font-medium">
              Description
            </Text>
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
      )}
    </SafeAreaView>
  );
}
