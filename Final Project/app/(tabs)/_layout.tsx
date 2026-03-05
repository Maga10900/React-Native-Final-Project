import { Ionicons } from "@expo/vector-icons";
import { Tabs, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Text, View } from "react-native";
import {
    getClientNotifications,
    getWorkerNotifications,
} from "../../src/api/notification";
import {
    getCurrentUserRole,
    getCurrentWorkerId,
} from "../../src/api/workerProfile";

// Singleton shared state for unread count so tab icon and screen can share it
let _unreadCount = 0;
let _listeners: Array<(n: number) => void> = [];

function subscribeUnread(fn: (n: number) => void) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

async function refreshUnreadCount() {
  try {
    const role = await getCurrentUserRole();
    const userId = await getCurrentWorkerId();
    if (!userId) return;

    let data: { isRead: boolean }[] = [];
    if (role === "Worker") {
      data = await getWorkerNotifications(userId);
    } else if (role === "Client") {
      data = await getClientNotifications(userId);
    }
    const count = (data || []).filter((n) => !n.isRead).length;
    _unreadCount = count;
    _listeners.forEach((fn) => fn(count));
  } catch {
    // silently ignore
  }
}

function NotificationBadge({ color, size }: { color: string; size: number }) {
  const [count, setCount] = useState(_unreadCount);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Subscribe to count changes
    const unsub = subscribeUnread(setCount);

    // Initial load
    refreshUnreadCount();

    // Poll every 30 seconds
    intervalRef.current = setInterval(refreshUnreadCount, 30000);

    return () => {
      unsub();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View
      style={{
        width: size + 10,
        height: size + 10,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="notifications" size={size} color={color} />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "#EF4444",
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
            {count > 9 ? "9+" : count}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => backHandler.remove();
    }, []),
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2C2C2C",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <NotificationBadge color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
