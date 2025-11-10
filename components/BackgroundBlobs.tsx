import { View } from "react-native";

export function BackgroundBlobs() {
  return (
    <View className="absolute inset-0">
      <View className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/40 rounded-full" />
      <View className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/40 rounded-full" />
      <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200/40 rounded-full" />
    </View>
  );
}
