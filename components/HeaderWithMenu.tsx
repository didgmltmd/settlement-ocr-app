import { HelpCircle, LogOut, Menu, Settings, User } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import SideSheet from "./SideSheet";

type Props = {
  username: string;
  onLogout: () => void;
  title?: string;
};

export default function HeaderWithMenu({
  username,
  onLogout,
  title = "정산 그룹",
}: Props) {
  const [open, setOpen] = useState(false);
  const initial = useMemo(
    () => (username?.[0] ?? "?").toUpperCase(),
    [username]
  );

  return (
    <>
      {/* Header */}
      <View
        style={{
          paddingTop: 14,
          paddingHorizontal: 16,
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Hamburger + Title */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => setOpen(true)}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: pressed ? "#eef2ff" : "transparent",
              })}
            >
              <Menu color="#334155" size={20} />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#0f172a" }}>
              {title}
            </Text>
          </View>

          {/* Right: online pill (desktop-only 느낌을 간소화) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              backgroundColor: "#eef2ff",
            }}
          ></View>
        </View>
      </View>

      {/* Side Sheet */}
      <SideSheet open={open} onClose={() => setOpen(false)}>
        {/* User Profile Card */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 16,
            borderRadius: 16,
            backgroundColor: "#eef2ff", // indigo-50 느낌
            marginTop: 8,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#6366f1", // indigo-500
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 18 }}>
              {initial}
            </Text>
          </View>
          <View>
            <Text style={{ color: "#0f172a", fontWeight: "600" }}>
              {username}
            </Text>
            <Text style={{ color: "#64748b", fontSize: 12 }}>계정 관리</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={{ marginTop: 16 }}>
          <MenuItem
            icon={<User color="#0f172a" size={18} />}
            label="프로필 설정"
            onPress={() => {}}
          />
          <MenuItem
            icon={<Settings color="#0f172a" size={18} />}
            label="환경 설정"
            onPress={() => {}}
          />
          <MenuItem
            icon={<HelpCircle color="#0f172a" size={18} />}
            label="도움말"
            onPress={() => {}}
          />
        </View>

        {/* Divider */}
        <View
          style={{ height: 1, backgroundColor: "#e2e8f0", marginVertical: 16 }}
        />

        {/* Logout */}
        <Pressable
          onPress={() => {
            setOpen(false);
            onLogout();
          }}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: pressed ? "#fecaca" : "#fecaca",
            backgroundColor: pressed ? "#fee2e2" : "white",
          })}
        >
          <LogOut color="#dc2626" size={18} />
          <Text style={{ color: "#dc2626", fontWeight: "600" }}>로그아웃</Text>
        </Pressable>

        {/* Footer */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
            1/N 정산 앱 v1.0
          </Text>
        </View>
      </SideSheet>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: pressed ? "#eef2ff" : "transparent",
      })}
    >
      {icon}
      <Text style={{ color: "#0f172a" }}>{label}</Text>
    </Pressable>
  );
}
