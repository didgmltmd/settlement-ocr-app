// components/SideSheet.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  open: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
};

export default function SideSheet({ open, onClose, width, children }: Props) {
  const { top, bottom } = useSafeAreaInsets();
  const screenW = Dimensions.get("window").width;
  const sheetW = Math.min(width ?? screenW * 0.8, 360);

  const tx = useRef(new Animated.Value(-sheetW)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
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
  }, [open, sheetW, tx, overlay]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle={
        Platform.OS === "ios" ? "overFullScreen" : "fullScreen"
      }
    >
      {/* Overlay (전체 화면) */}
      <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.4)", opacity: overlay },
          ]}
        />
      </Pressable>

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: top,
          bottom: bottom,
        }}
      >
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
            borderRightWidth: StyleSheet.hairlineWidth,
            borderRightColor: "#e2e8f0",
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            borderTopRightRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
