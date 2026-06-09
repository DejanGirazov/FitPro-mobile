import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";
import "./globals.css";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [mounted, setMounted] = useState(false);

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.error) return null;
        return data;
      } catch (err) {
        return null;
      }
    },
    retry: false,
  });
  useEffect(() => {
    setMounted(true); // ← mark as mounted
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";

    if (!authUser && inTabsGroup) {
      router.replace("/login" as any);
    } else if (authUser && !inTabsGroup) {
      router.replace("/(tabs)/home" as any);
    }
  }, [authUser, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0A0F1E",
        }}
      >
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signUp" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
