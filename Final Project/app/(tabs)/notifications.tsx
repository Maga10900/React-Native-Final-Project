import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import {
    getClientNotifications,
    getWorkerNotifications,
    NotificationModel,
    updateNotification,
} from "../../src/api/notification";
import {
    getCurrentUserRole,
    getCurrentWorkerId,
} from "../../src/api/workerProfile";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("accept")) {
    return { name: "checkmark-circle" as const, color: "#16A34A" };
  }
  if (lower.includes("reject") || lower.includes("decline")) {
    return { name: "close-circle" as const, color: "#DC2626" };
  }
  return { name: "notifications" as const, color: "#3B82F6" };
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const role = await getCurrentUserRole();
      console.log("User role:", role);
      const userId = await getCurrentWorkerId(); // works for both Worker and Client
      console.log("User ID:", userId);

      if (!userId) return;

      let data: NotificationModel[] = [];

      if (role === "Worker") {
        data = await getWorkerNotifications(userId);
        console.log("Worker notifications:", data);
      } else if (role === "Client") {
        data = await getClientNotifications(userId);
        console.log("Client notifications:", data);
      }

      if (data) {
        // Sort: unread first, then by newest
        const sorted = [...data].sort((a, b) => {
          if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
          return (
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
          );
        });
        setNotifications(sorted);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      async function load() {
        if (isActive) setLoading(true);
        await fetchNotifications();
        if (isActive) setLoading(false);
      }
      load();
      return () => {
        isActive = false;
      };
    }, [fetchNotifications]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (item: NotificationModel) => {
    if (item.isRead) return;
    try {
      await updateNotification({
        id: item.id,
        message: item.message,
        isRead: true,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: NotificationModel }) => {
    const icon = getNotificationIcon(item.message);
    return (
      <Pressable
        onPress={() => handleMarkAsRead(item)}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#F3F4F6",
            backgroundColor: item.isRead ? "#FFFFFF" : "#EFF6FF",
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: item.isRead ? "#F3F4F6" : "#DBEAFE",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              marginTop: 2,
            }}
          >
            <Ionicons name={icon.name} size={22} color={icon.color} />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontWeight: item.isRead ? "600" : "700",
                  fontSize: 14,
                  color: item.isRead ? "#6B7280" : "#111827",
                }}
              >
                Order Update
              </Text>
              {item.createdDate ? (
                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {formatRelativeTime(item.createdDate)}
                </Text>
              ) : null}
            </View>

            <Text style={{ fontSize: 13, color: "#374151", lineHeight: 18 }}>
              {item.message}
            </Text>

            {!item.isRead && (
              <Text
                style={{
                  fontSize: 11,
                  color: "#3B82F6",
                  marginTop: 6,
                  fontWeight: "600",
                }}
              >
                Tap to mark as read
              </Text>
            )}
          </View>

          {/* Unread dot */}
          {!item.isRead && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#3B82F6",
                marginLeft: 8,
                marginTop: 8,
              }}
            />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: 48 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          marginBottom: 2,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>
          Notifications
        </Text>
        {unreadCount > 0 && (
          <View
            style={{
              backgroundColor: "#3B82F6",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              {unreadCount} new
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 80,
              }}
            >
              <Ionicons
                name="notifications-off-outline"
                size={56}
                color="#D1D5DB"
              />
              <Text
                style={{
                  color: "#9CA3AF",
                  marginTop: 16,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                No notifications yet
              </Text>
              <Text style={{ color: "#D1D5DB", marginTop: 6, fontSize: 13 }}>
                You&apos;ll see order updates here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
