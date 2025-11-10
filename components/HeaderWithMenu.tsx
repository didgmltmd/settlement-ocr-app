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
      <View className="px-4 pb-2">
        <View className="flex-row items-center justify-between">
          {/* Left: Hamburger + Title */}
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setOpen(true)}
              style={({ pressed }) => [
                {
                  borderRadius: 12,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                },
                pressed ? { backgroundColor: "#eef2ff" } : null, // pressed 상태만 콜백 유지
              ]}
            >
              <Menu color="#334155" size={20} />
            </Pressable>

            <Text className="text-[18px] font-semibold text-slate-900">
              {title}
            </Text>
          </View>

          {/* 우측 배지(필요시 내용 넣기) */}
          <View className="flex-row items-center gap-2 py-1.5 px-2.5 rounded-full bg-indigo-50" />
        </View>
      </View>

      {/* Side Sheet */}
      <SideSheet open={open} onClose={() => setOpen(false)}>
        {/* User Profile Card */}
        <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-indigo-50 mt-2 mb-5">
          <View className="w-14 h-14 rounded-[14px] items-center justify-center bg-indigo-600 shadow-black/20 shadow-md">
            <Text className="text-white font-bold text-[18px]">{initial}</Text>
          </View>
          <View>
            <Text className="text-slate-900 font-semibold">{username}</Text>
            <Text className="text-slate-500 text-xs">계정 관리</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-8 min-h-[10rem] flex-col justify-between">
          <Pressable className="flex-row items-center gap-3 p-3 rounded-xl bg-indigo-50">
            <User color="#334155" size={18} />
            <Text className="text-slate-900">프로필 설정</Text>
          </Pressable>
          <Pressable className="flex-row items-center gap-3 p-3 rounded-xl bg-indigo-50">
            <Settings color="#334155" size={18} />
            <Text className="text-slate-900">설정</Text>
          </Pressable>
          <Pressable className="flex-row items-center gap-3 p-3 rounded-xl bg-indigo-50">
            <HelpCircle color="#334155" size={18} />
            <Text className="text-slate-900">도움말</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="h-px bg-slate-200 my-4" />

        {/* Logout */}
        <Pressable
          onPress={() => {
            setOpen(false);
            onLogout();
          }}
          style={({ pressed }) => [
            {
              borderRadius: 12,
              borderWidth: 1,
              paddingVertical: 12,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            },
            {
              borderColor: "#fecaca",
              backgroundColor: pressed ? "#fee2e2" : "white",
            },
          ]}
        >
          <LogOut color="#dc2626" size={18} />
          <Text className="text-red-600 font-semibold">로그아웃</Text>
        </Pressable>

        {/* Footer */}
        <View className="mt-6">
          <Text className="text-center text-slate-400 text-xs">
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
      style={({ pressed }) => [
        {
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
        pressed ? { backgroundColor: "#eef2ff" } : null,
      ]}
    >
      {icon}
      <Text className="text-slate-900">{label}</Text>
    </Pressable>
  );
}
