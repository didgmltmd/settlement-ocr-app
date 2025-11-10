// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

import { AppStateProvider } from "../lib/app-state"; // ✅ 경로/이름 정확히
// import { BackgroundBlobs } from "../components/BackgroundBlobs"; // 선택

export default function RootLayout() {
  useEffect(() => {
    LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* ✅ 전역 상태 컨텍스트는 반드시 루트에서 감싸야 합니다 */}
        <AppStateProvider>
          {/* <BackgroundBlobs />  // pointerEvents="none" 권장 */}
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="auth" />
              <Stack.Screen name="groups" />
              <Stack.Screen name="expenses" />
              <Stack.Screen name="settlement" />
            </Stack>
            <Toast />
            <StatusBar style="auto" />
          </SafeAreaView>
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
