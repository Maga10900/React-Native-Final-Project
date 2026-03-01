import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";
import { getOrdersByWorkerId, Order } from "../../src/api/order";
import { getAllWorkers } from "../../src/api/worker";
import {
    getCurrentUserRole,
    getCurrentWorkerId,
    WorkerProfile,
} from "../../src/api/workerProfile";

export default function TabIndex() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const userRole = await getCurrentUserRole();
        setRole(userRole);

        if (userRole === "Worker" || userRole === "4") {
          const workerId = await getCurrentWorkerId();
          if (workerId) {
            const ordersData = await getOrdersByWorkerId(workerId);
            setOrders(ordersData || []);
          }
        } else {
          const data = await getAllWorkers();
          setWorkers(data || []);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const renderWorker = ({ item }: { item: WorkerProfile }) => (
    <View className="bg-white p-4 m-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-4">
        {item.profilePhoto ? (
          <Image
            source={{ uri: item.profilePhoto }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-200 justify-center items-center">
            <Ionicons name="person" size={32} color="gray" />
          </View>
        )}
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-gray-800">
            {item.firstName} {item.lastName}
          </Text>
          <Text className="text-gray-500">{item.job || "Worker"}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Text className="ml-1 text-gray-600 font-semibold">
              {item.rating || "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {item.description ? (
        <Text className="text-gray-600 text-sm mb-4" numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      {role !== "Worker" && (
        <Pressable
          className="bg-black py-3 rounded-lg items-center mt-2 border border-gray-800"
          onPress={() =>
            router.push({
              pathname: "/book-worker",
              params: { workerId: item.id },
            } as any)
          }
        >
          <Text className="text-white font-bold text-base">Book Now</Text>
        </Pressable>
      )}
    </View>
  );

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
        <View
          className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}
        >
          <Text className="text-xs font-bold">
            {getStatusText(item.status)}
          </Text>
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

      {/* 
        This is where the user might want a button to accept/reject or view details. 
        We just show info for now. 
      */}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-12">
      <View className="flex-row items-center px-4 py-2 relative pb-4 border-b border-gray-200 bg-white">
        <Text className="text-xl font-bold flex-1 text-center">
          {role === "Worker" ? "My Orders" : "Workers"}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : role === "Worker" ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 items-center mt-20">
              <Text className="text-gray-500">No orders found.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.id}
          renderItem={renderWorker}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="flex-1 items-center mt-20">
              <Text className="text-gray-500">No workers found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
