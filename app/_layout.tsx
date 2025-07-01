import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { setupNotifications } from "@/utils/notification";

export default function RootLayout() {
  useEffect(() => {
    setupNotifications();
    // Handle incoming links
    const sub = Linking.addEventListener("url", ({ url }) => {
      // Expo Router handles deep links automatically
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" backgroundColor="#000" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          contentStyle: { backgroundColor: "#000" },
        }}
      />
    </ThemeProvider>
  );
}
