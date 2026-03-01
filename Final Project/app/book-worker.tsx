import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { createOrder } from "../src/api/order";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function BookWorkerScreen() {
  const { workerId } = useLocalSearchParams<{ workerId: string }>();
  const [salary, setSalary] = useState("");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerCoords, setMarkerCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Permission to access location was denied",
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMarkerCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      reverseGeocode(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setLocationLoading(true);
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (result.length > 0) {
        const place = result[0];
        const formattedAddress =
          `${place.name ? place.name + ", " : ""}${place.street || ""} ${place.city || ""} ${place.region || ""}`.trim();
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.log("Error reverse geocoding:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapPress = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerCoords(coords);
    reverseGeocode(coords.latitude, coords.longitude);
  };

  const handleBook = async () => {
    if (!salary || !address || !details) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        workerId: workerId as string,
        salary: parseFloat(salary),
        address,
        details,
        photos: [],
      });
      Alert.alert("Success", "Worker booked successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to book worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: 48 }}>
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text className="text-xl font-bold ml-4">Book Worker</Text>
      </View>

      <ScrollView className="p-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Salary Offer</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            placeholder="e.g. 100"
            keyboardType="numeric"
            value={salary}
            onChangeText={setSalary}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Location</Text>
          <Text className="text-gray-500 text-xs mb-2">
            Tap on the map to select your address
          </Text>

          <View
            style={{
              height: 200,
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              marginBottom: 8,
            }}
          >
            <MapView
              style={{ flex: 1 }}
              region={region}
              onPress={handleMapPress}
            >
              {markerCoords && <Marker coordinate={markerCoords} />}
            </MapView>
          </View>

          <View className="relative">
            <TextInput
              className={`border border-gray-300 rounded-lg p-3 bg-gray-50 text-base ${locationLoading ? "opacity-50" : ""}`}
              placeholder="Your full address"
              value={address}
              onChangeText={setAddress}
            />
            {locationLoading && (
              <View className="absolute right-3 top-3">
                <ActivityIndicator size="small" color="black" />
              </View>
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">
            Job Details & Requirements
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base min-h-[100px]"
            placeholder="Describe the job in detail..."
            multiline
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <Pressable
          className={`bg-black py-4 rounded-lg items-center mb-10 ${loading ? "opacity-70" : ""}`}
          onPress={handleBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Send Booking Request
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
