import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    getOrderById,
    getOrdersByClientId,
    getOrdersByWorkerId,
    Order,
} from "../src/api/order";
import {
    getCurrentUserRole,
    getCurrentWorkerId,
} from "../src/api/workerProfile";

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchOrders() {
        try {
          if (isActive) {
            setLoading(true);
            setError(null);
          }

          const userId = await getCurrentWorkerId();
          const userRole = await getCurrentUserRole();

          console.log("[MyOrders] userId:", userId, "role:", userRole);

          if (!userId)
            throw new Error(
              "Could not read user ID from token. Please log out and log in again.",
            );

          if (isActive) {
            setRole(userRole);
          }

          let data: Order[] = [];
          if (userRole === "Worker") {
            data = await getOrdersByWorkerId(userId);
          } else {
            data = await getOrdersByClientId(userId);
          }

          if (isActive) {
            setOrders(data || []);
          }
        } catch (error: any) {
          console.error("Failed to load orders", error);
          if (isActive) setError(error?.message || "Failed to load orders");
        } finally {
          if (isActive) setLoading(false);
        }
      }

      fetchOrders();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("Please enter an Order ID");
      return;
    }

    setSearching(true);
    setSearchError("");

    try {
      const result = await getOrderById(searchQuery.trim());
      if (result) {
        router.push({
          pathname: "/order-details",
          params: { id: result.id, orderParams: JSON.stringify(result) },
        } as any);
      } else {
        setSearchError("Order not found");
      }
    } catch (err) {
      console.error("Failed to fetch order", err);
      setSearchError("Order not found or access denied");
    } finally {
      setSearching(false);
    }
  };

  const normalizeOrderStatus = (order: Order): number => {
    // Check various property names the backend might use
    const status =
      (order as any).status !== undefined
        ? (order as any).status
        : (order as any).Status !== undefined
          ? (order as any).Status
          : (order as any).orderStatus !== undefined
            ? (order as any).orderStatus
            : undefined;

    // Handle string values from .NET enum serialization
    if (typeof status === "string") {
      const s = status.toLowerCase();
      if (s === "pending") return 0;
      if (s === "accepted") return 1;
      if (s === "rejected") return 2;
    }
    // Some backends use 1-based (1=Pending, 2=Accepted, 3=Rejected)
    if (status === 1) return 0;
    if (status === 2) return 1;
    if (status === 3) return 2;

    // Default to numeric if present
    if (status !== undefined && status !== null) return Number(status);

    return 0; // Fallback to Pending
  };

  const getStatusText = (order: Order) => {
    switch (normalizeOrderStatus(order)) {
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

  const getStatusColor = (order: Order) => {
    switch (normalizeOrderStatus(order)) {
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

  const renderOrder = ({ item }: { item: Order }) => (
    <Pressable
      className="bg-white p-4 m-4 rounded-xl shadow-sm border border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/order-details",
          params: { orderParams: JSON.stringify(item) },
        } as any)
      }
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-800">
          Order #{item.id.slice(-6)}
        </Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item)}`}>
          <Text className="text-xs font-bold">{getStatusText(item)}</Text>
        </View>
      </View>
      <View className="flex-row items-center mb-2">
        <Ionicons name="location-outline" size={16} color="gray" />
        <Text className="text-gray-600 ml-1 flex-1" numberOfLines={1}>
          {item.address}
        </Text>
      </View>
      <View className="flex-row items-center mb-3">
        <Ionicons name="cash-outline" size={16} color="gray" />
        <Text className="text-gray-600 ml-1 font-semibold">${item.salary}</Text>
      </View>
      {item.details ? (
        <Text className="text-gray-500 text-sm mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {item.details}
        </Text>
      ) : null}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-8">
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100 mb-2">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="black" />
        </Pressable>
        <Text className="text-xl font-bold ml-4">
          {role === "Worker" || role === "4"
            ? "My Assigned Orders"
            : role === "Client" || role === "5"
              ? "My Placed Orders"
              : "My Orders"}
        </Text>
      </View>

      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            placeholder="Search Order by ID..."
            className="flex-1 ml-2 text-base"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setSearchError("");
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} className="mr-2">
              <Ionicons name="close-circle" size={20} color="gray" />
            </Pressable>
          )}
          {searching ? (
            <ActivityIndicator size="small" color="#2C2C2C" />
          ) : (
            <Pressable
              onPress={handleSearch}
              className="bg-blue-500 px-3 py-1 rounded-lg"
            >
              <Text className="text-white font-semibold">Find</Text>
            </Pressable>
          )}
        </View>
        {searchError ? (
          <Text className="text-red-500 text-sm mt-2 ml-1">{searchError}</Text>
        ) : null}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2C2C2C" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center mt-20 px-8">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-base mt-4 text-center">
            {error}
          </Text>
          <Pressable
            className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
            onPress={() => {
              setError(null);
              setOrders([]);
              setLoading(true);
            }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20 px-8">
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#D1D5DB"
              />
              <Text className="text-gray-500 text-lg mt-4 text-center">
                {role === "Worker"
                  ? "You don't have any assigned orders yet."
                  : role === "Client"
                    ? "You haven't placed any orders yet."
                    : "No orders available."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
