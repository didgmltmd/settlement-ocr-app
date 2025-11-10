import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";

type Props = {
  open: boolean;
  onClose: () => void;
  width?: number; // default 80% of screen
  children: React.ReactNode;
};

export default function SideSheet({ open, onClose, width, children }: Props) {
  const screenW = Dimensions.get("window").width;
  const sheetW = Math.min(width ?? screenW * 0.8, 360);
  const tx = useRef(new Animated.Value(-sheetW)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  // open 바뀔 때 애니메이션
  useEffect(() => {
    if (open) {
      // 모달 열릴 때 초기 위치 보장
      tx.setValue(-sheetW);
      overlay.setValue(0);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(tx, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(overlay, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(tx, {
          toValue: -sheetW,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlay, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, sheetW, overlay, tx]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay */}
      <Pressable
        onPress={onClose}
        style={StyleSheet.absoluteFillObject}
        android_ripple={{ color: "rgba(0,0,0,0.08)" }}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.4)", opacity: overlay },
          ]}
        />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: sheetW,
          transform: [{ translateX: tx }],
          backgroundColor: "white",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          borderRightWidth: StyleSheet.hairlineWidth,
          borderRightColor: "#e2e8f0",
        }}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}
