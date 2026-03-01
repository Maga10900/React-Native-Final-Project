import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Order } from "../src/api/order";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function OrderDetailsScreen() {
  const { orderParams } = useLocalSearchParams<{ orderParams: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (orderParams) {
      try {
        const parsedOrder = JSON.parse(orderParams) as Order;
        setOrder(parsedOrder);
        geocodeAddress(parsedOrder.address);
      } catch (error) {
        console.error("Failed to parse order details:", error);
      }
    }
  }, [orderParams]);

  const geocodeAddress = async (address: string) => {
    try {
      const result = await Location.geocodeAsync(address);
      if (result.length > 0) {
        const { latitude, longitude } = result[0];
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setMarkerCoords({ latitude, longitude });
      }
    } catch (error) {
      console.log("Error geocoding address:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Accepted";
      case 2:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!order) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: 48 }}>
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text className="text-xl font-bold ml-4">Order Details</Text>
      </View>

      <ScrollView className="p-4 flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500 font-semibold uppercase tracking-wider text-xs">
              Order ID
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
            >
              <Text className="text-xs font-bold">
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-bold text-gray-800 mb-4">
            #{order.id}
          </Text>

          {/* Salary */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="cash-outline" size={20} color="#4B5563" />
            <Text className="text-gray-600 ml-2 font-medium">
              Salary Offer:
            </Text>
            <Text className="text-gray-900 ml-auto font-bold text-lg">
              ${order.salary}
            </Text>
          </View>

          {/* Creation Date if available */}
          {order.createdDate && (
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#4B5563" />
              <Text className="text-gray-600 ml-2 font-medium">Created:</Text>
              <Text className="text-gray-900 ml-auto font-semibold">
                {new Date(order.createdDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Location / Map */}
        <View className="mb-6">
          <Text className="text-gray-800 font-bold text-lg mb-3">
            Service Location
          </Text>

          <View className="flex-row items-start mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <Ionicons
              name="location"
              size={20}
              color="#EF4444"
              className="mt-0.5"
            />
            <Text className="text-gray-700 ml-2 flex-1 leading-5">
              {order.address}
            </Text>
          </View>

          <View
            style={{
              height: 220,
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#F3F4F6",
            }}
          >
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="small" color="#9CA3AF" />
                <Text className="text-gray-400 text-xs mt-2">
                  Loading map...
                </Text>
              </View>
            ) : (
              <MapView
                style={{ flex: 1 }}
                region={region}
                scrollEnabled={false} // Make it read-only
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {markerCoords && <Marker coordinate={markerCoords} />}
              </MapView>
            )}
          </View>
        </View>

        {/* Job Details */}
        <View className="mb-10">
          <Text className="text-gray-800 font-bold text-lg mb-3">
            Job Description & Requirements
          </Text>
          <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[120px]">
            {order.details ? (
              <Text className="text-gray-700 leading-6 text-base">
                {order.details}
              </Text>
            ) : (
              <Text className="text-gray-400 italic">
                No additional details provided by the client.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
