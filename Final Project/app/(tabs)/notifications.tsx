import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import {
    getClientNotifications,
    getWorkerNotifications,
    NotificationModel,
} from "../../src/api/notification";
import {
    getCurrentUserRole,
    getCurrentWorkerId,
} from "../../src/api/workerProfile";
import { getToken } from "../../src/storage/token";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function fetchNotifications() {
        try {
          if (isActive) setLoading(true);

          const role = await getCurrentUserRole();

          if (role === "Worker") {
            const workerId = await getCurrentWorkerId();
            if (workerId) {
              const data = await getWorkerNotifications(workerId);
              if (isActive && data) {
                setNotifications(data);
              }
            }
          } else if (role === "Client") {
            const token = await getToken();
            if (token) {
              const decoded = jwtDecode<any>(token);
              const userId = decoded.id || decoded.nameid;
              if (userId) {
                const data = await getClientNotifications(userId);
                if (isActive && data) {
                  setNotifications(data);
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to load notifications", error);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchNotifications();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const renderItem = ({ item }: { item: NotificationModel }) => (
    <View
      className={`p-4 border-b border-gray-100 ${item.isRead ? "bg-white" : "bg-blue-50"}`}
    >
      <View className="flex-row items-center mb-1">
        <Ionicons
          name="notifications"
          size={20}
          color={item.isRead ? "gray" : "#3b82f6"}
        />
        <Text
          className={`ml-2 text-base ${item.isRead ? "text-gray-600" : "text-gray-900 font-bold"}`}
        >
          Order Update
        </Text>
      </View>
      <Text className="text-gray-600 ml-7">{item.message}</Text>
      {item.createDate && (
        <Text className="text-xs text-gray-400 ml-7 mt-1">
          {new Date(item.createDate).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white pt-12">
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100 mb-2">
        <Text className="text-xl font-bold ml-2">Notifications</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="gray"
              />
              <Text className="text-gray-500 mt-4 text-lg">
                No notifications yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
