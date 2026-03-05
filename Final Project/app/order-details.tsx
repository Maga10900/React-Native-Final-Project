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
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { addNotification } from "../src/api/notification";
import {
    acceptOrder,
    getOrderById,
    Order,
    rejectOrder,
} from "../src/api/order";
import { getCurrentUserRole } from "../src/api/workerProfile";

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function OrderDetailsScreen() {
  const { orderParams, id } = useLocalSearchParams<{
    orderParams?: string;
    id?: string;
  }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    async function init() {
      // Load role
      const userRole = await getCurrentUserRole();
      setRole(userRole);

      // Load order
      if (orderParams) {
        try {
          const parsedOrder = JSON.parse(orderParams) as Order;
          setOrder(parsedOrder);
          geocodeAddress(parsedOrder.address);
        } catch (error) {
          console.error("Failed to parse order details:", error);
          setLoading(false);
        }
      } else if (id) {
        try {
          const fetchedOrder = await getOrderById(id);
          setOrder(fetchedOrder);
          geocodeAddress(fetchedOrder.address);
        } catch (error) {
          console.error("Failed to fetch order:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    init();
  }, [orderParams, id]);

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

  const handleAccept = async () => {
    if (!order) return;
    Alert.alert("Accept Order", "Are you sure you want to accept this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        style: "default",
        onPress: async () => {
          setActionLoading(true);
          try {
            await acceptOrder(order.id);
            setOrder({ ...order, status: 2 });

            // Notify client
            try {
              await addNotification({
                workerId: order.workerId,
                clientId: order.clientId,
                orderId: order.id,
                message: `Worker has accepted your order #${order.id.slice(-6)}`,
              });
            } catch (notifyErr) {
              console.error("Failed to notify client:", notifyErr);
            }

            Alert.alert("Success", "Order accepted successfully!");
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to accept order");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleReject = async () => {
    if (!order) return;
    Alert.alert("Reject Order", "Are you sure you want to reject this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            await rejectOrder(order.id);
            setOrder({ ...order, status: 3 });

            // Notify client
            try {
              await addNotification({
                workerId: order.workerId,
                clientId: order.clientId,
                orderId: order.id,
                message: `Worker has rejected your order #${order.id.slice(-6)}`,
              });
            } catch (notifyErr) {
              console.error("Failed to notify client:", notifyErr);
            }

            Alert.alert("Order Rejected", "The order has been rejected.");
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Failed to reject order");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const normalizeStatus = (order: any): number => {
    if (!order) return 0;

    let status =
      order.status !== undefined
        ? order.status
        : order.Status !== undefined
          ? order.Status
          : order.orderStatus !== undefined
            ? order.orderStatus
            : undefined;

    if (status === undefined || status === null) return 0;

    // Handle string values (both "Rejected" and "3")
    if (typeof status === "string") {
      const s = status.toLowerCase();
      if (s === "pending") return 0;
      if (s === "accepted") return 1;
      if (s === "rejected") return 2;

      const num = parseInt(status, 10);
      if (!isNaN(num)) status = num;
    }

    // Backend is 1-based (1=Pending, 2=Accepted, 3=Rejected)
    // We map to 0-based for internal UI logic (0=Pending, 1=Accepted, 2=Rejected)
    if (status === 1) return 0;
    if (status === 2) return 1;
    if (status === 3) return 2;

    return 0;
  };

  const getStatusText = (order: any) => {
    const s = normalizeStatus(order);
    if (s === 0) return "Pending";
    if (s === 1) return "Accepted";
    if (s === 2) return "Rejected";
    return "Unknown";
  };

  const getStatusColor = (order: any) => {
    switch (normalizeStatus(order)) {
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

  console.log("[OrderDetails] raw order:", JSON.stringify(order));

  const isWorker = role === "Worker";
  const normalizedStatus = normalizeStatus(order);
  const isPending = normalizedStatus === 0;

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
            <View className={`px-3 py-1 rounded-full ${getStatusColor(order)}`}>
              <Text className="text-xs font-bold">{getStatusText(order)}</Text>
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

          {/* Creation Date */}
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
                scrollEnabled={false}
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
        <View className="mb-6">
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

        {/* Worker Accept / Reject buttons — only shown to worker on pending orders */}
        {isWorker && isPending && (
          <View className="mb-10">
            <Text className="text-gray-800 font-bold text-lg mb-3">
              Your Decision
            </Text>
            {actionLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator size="large" color="#2C2C2C" />
                <Text className="text-gray-500 mt-2">Processing...</Text>
              </View>
            ) : (
              <View className="flex-row gap-4">
                <Pressable
                  onPress={handleAccept}
                  className="flex-1 bg-green-500 py-4 rounded-xl items-center"
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color="white"
                  />
                  <Text className="text-white font-bold text-base mt-1">
                    Accept
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleReject}
                  className="flex-1 bg-red-500 py-4 rounded-xl items-center"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="white"
                  />
                  <Text className="text-white font-bold text-base mt-1">
                    Reject
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Already decided — show status banner */}
        {isWorker && !isPending && (
          <View
            className={`mb-10 p-4 rounded-xl items-center ${normalizedStatus === 1 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <Ionicons
              name={
                normalizedStatus === 1 ? "checkmark-circle" : "close-circle"
              }
              size={36}
              color={normalizedStatus === 1 ? "#16A34A" : "#DC2626"}
            />
            <Text
              className={`font-bold text-base mt-2 ${normalizedStatus === 1 ? "text-green-700" : "text-red-700"}`}
            >
              {normalizedStatus === 1
                ? "You accepted this order"
                : "You rejected this order"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
