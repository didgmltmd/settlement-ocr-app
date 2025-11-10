import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
};

/**
 * GradientCard — RN용 카드형 그라데이션 컨테이너
 * NativeWind className은 지원 안 하므로 style 직접 사용
 */
export default function GradientCard({
  children,
  colors = ["#6366f1", "#8b5cf6", "#ec4899"],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
}: Props) {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        {
          borderRadius: 24,
          padding: 24,
          elevation: 4, // Android shadow
          shadowColor: "#000", // iOS shadow
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}
