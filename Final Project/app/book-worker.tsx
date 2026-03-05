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
import { getCurrentWorkerId } from "../src/api/workerProfile";
import { CardInfo, getCards } from "../src/storage/card";
import { getToken } from "../src/storage/token";

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
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card">("Cash");
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

      // Load all cards
      const data = await getCards();
      setCards(data);
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
    const newErrors: { [key: string]: string } = {};
    if (!salary) newErrors.salary = "Salary offer is required";
    if (!address) newErrors.address = "Address is required";
    if (!details) newErrors.details = "Job details are required";
    if (paymentMethod === "Card" && cards.length === 0)
      newErrors.payment = "Please add a card in your profile first";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const clientId = await getCurrentWorkerId();
      if (!clientId) throw new Error("Failed to retrieve Client ID");

      await createOrder({
        workerId: workerId as string,
        clientId,
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
            className={`border ${errors.salary ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base`}
            placeholder="e.g. 100"
            keyboardType="numeric"
            value={salary}
            onChangeText={(text) => {
              setSalary(text);
              if (errors.salary) setErrors((prev) => ({ ...prev, salary: "" }));
            }}
          />
          {errors.salary && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.salary}
            </Text>
          )}
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
              borderColor: errors.address ? "#EF4444" : "#D1D5DB",
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
              className={`border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base ${locationLoading ? "opacity-50" : ""}`}
              placeholder="Your full address"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (errors.address)
                  setErrors((prev) => ({ ...prev, address: "" }));
              }}
            />
            {locationLoading && (
              <View className="absolute right-3 top-3">
                <ActivityIndicator size="small" color="black" />
              </View>
            )}
            {errors.address && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                {errors.address}
              </Text>
            )}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">
            Job Details & Requirements
          </Text>
          <TextInput
            className={`border ${errors.details ? "border-red-500" : "border-gray-300"} rounded-lg p-3 bg-gray-50 text-base min-h-[100px]`}
            placeholder="Describe the job in detail..."
            multiline
            textAlignVertical="top"
            value={details}
            onChangeText={(text) => {
              setDetails(text);
              if (errors.details)
                setErrors((prev) => ({ ...prev, details: "" }));
            }}
          />
          {errors.details && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.details}
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-3">
            Payment Method
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                setPaymentMethod("Cash");
                if (errors.payment)
                  setErrors((prev) => ({ ...prev, payment: "" }));
              }}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${paymentMethod === "Cash" ? "bg-black border-black" : "bg-white border-gray-200"}`}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={paymentMethod === "Cash" ? "white" : "black"}
              />
              <Text
                className={`ml-2 font-semibold ${paymentMethod === "Cash" ? "text-white" : "text-black"}`}
              >
                Cash
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setPaymentMethod("Card");
                if (errors.payment)
                  setErrors((prev) => ({ ...prev, payment: "" }));
              }}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${paymentMethod === "Card" ? "bg-black border-black" : "bg-white border-gray-200"}`}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={paymentMethod === "Card" ? "white" : "black"}
              />
              <Text
                className={`ml-2 font-semibold ${paymentMethod === "Card" ? "text-white" : "text-black"}`}
              >
                Card
              </Text>
            </Pressable>
          </View>

          {paymentMethod === "Card" && (
            <View className={`mt-4 ${errors.payment ? "border-red-500" : ""}`}>
              {cards.length > 0 ? (
                <View>
                  <Text className="text-gray-500 text-xs mb-3 ml-1">
                    Select card for payment:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row gap-3"
                  >
                    {cards.map((card, index) => (
                      <Pressable
                        key={card.id}
                        onPress={() => setSelectedCardIndex(index)}
                        className={`p-4 rounded-2xl border min-w-[200px] mr-3 ${selectedCardIndex === index ? "bg-black border-black" : "bg-gray-50 border-gray-100"}`}
                      >
                        <View className="flex-row justify-between items-start mb-4">
                          <Ionicons
                            name="card"
                            size={24}
                            color={
                              selectedCardIndex === index ? "white" : "black"
                            }
                          />
                          {selectedCardIndex === index && (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="white"
                            />
                          )}
                        </View>
                        <Text
                          className={`font-bold ${selectedCardIndex === index ? "text-white" : "text-gray-800"}`}
                        >
                          **** {card.cardNumber.slice(-4)}
                        </Text>
                        <Text
                          className={`text-xs ${selectedCardIndex === index ? "text-gray-300" : "text-gray-500"}`}
                        >
                          {card.cardHolderName}
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => router.push("/card-payment" as any)}
                      className="p-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 min-w-[120px] justify-center items-center"
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={24}
                        color="gray"
                      />
                      <Text className="text-gray-500 text-xs mt-1 font-semibold">
                        Add Card
                      </Text>
                    </Pressable>
                  </ScrollView>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    router.push("/card-payment" as any);
                    if (errors.payment)
                      setErrors((prev) => ({ ...prev, payment: "" }));
                  }}
                  className="flex-row items-center p-4 bg-gray-50 rounded-xl border border-red-100"
                >
                  <Text className="text-red-500 font-semibold flex-1">
                    No card found. Click to add one.
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                </Pressable>
              )}
            </View>
          )}
          {errors.payment && cards.length === 0 && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {errors.payment}
            </Text>
          )}
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
