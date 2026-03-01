import { Stack } from "expo-router";
import "../global.css";
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen
        name="(tabs)"
        options={{
          // Prevents going back or swiping back to previous screens
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
