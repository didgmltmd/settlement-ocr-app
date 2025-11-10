import { router } from "expo-router";
import { Menu, Trash2, Users } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAppState } from "../lib/app-state";

type Group = { id: string; name: string; members: string[]; createdAt: string };

export default function Groups() {
  const { currentUser, setCurrentGroup, logout } = useAppState();
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "1",
      name: "제주도 여행",
      members: ["홍길동", "김철수", "이영희", "박민수"],
      createdAt: "2025-11-01",
    },
    {
      id: "2",
      name: "회사 회식",
      members: ["홍길동", "김철수", "이영희"],
      createdAt: "2025-10-28",
    },
  ]);

  if (!currentUser) {
    router.replace("/auth");
    return null;
  }

  const handleCreate = () => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: "새 그룹",
      members: [currentUser.name, "김철수"],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGroups([newGroup, ...groups]);
    Toast.show({ type: "success", text1: "그룹이 생성되었습니다" });
  };

  const handleDelete = (id: string) => {
    setGroups((gs) => gs.filter((g) => g.id !== id));
    Toast.show({ type: "success", text1: "그룹이 삭제되었습니다" });
  };

  return (
    <View className="flex-1 pt-14 px-6">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <Menu color="#334155" />
          <Text className="text-xl font-semibold">정산 그룹</Text>
        </View>
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleCreate}
            className="px-3 py-2 rounded-xl bg-indigo-600"
          >
            <Text className="text-white font-semibold">새 그룹</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              logout();
              router.replace("/auth");
            }}
            className="px-3 py-2 rounded-xl bg-white"
          >
            <Text className="text-rose-600 font-semibold">로그아웃</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
            onPress={() => {
              setCurrentGroup(item);
              router.push("/expenses");
            }}
          >
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center">
                  <Users color="#4f46e5" size={20} />
                </View>
                <Text className="text-base font-semibold">{item.name}</Text>
              </View>
              <Text className="text-slate-500 mt-1">
                멤버 {item.members.length}명 • 생성일 {item.createdAt}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDelete(item.id)}
              className="p-2 rounded-lg"
            >
              <Trash2 color="#ef4444" />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}
