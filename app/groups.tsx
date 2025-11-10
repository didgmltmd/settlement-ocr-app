// app/groups.tsx
import { Redirect, router } from "expo-router";
import { Plus, Trash2, Users } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import GradientCard from "../components/GradientCard";
import HeaderWithMenu from "../components/HeaderWithMenu";
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

  const greetingName = useMemo(
    () => (currentUser?.name ? currentUser.name : "친구"),
    [currentUser]
  );

  const handleCreate = () => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name: "새 그룹",
      members: [currentUser!.name, "김철수"],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGroups((gs) => [newGroup, ...gs]);
    Toast.show({ type: "success", text1: "그룹이 생성되었습니다" });
  };

  const handleDelete = (id: string) => {
    setGroups((gs) => gs.filter((g) => g.id !== id));
    Toast.show({ type: "success", text1: "그룹이 삭제되었습니다" });
  };

  if (!currentUser) return <Redirect href="/auth" />;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <HeaderWithMenu
        username={currentUser.name}
        onLogout={logout} // ⬅️ 여기서 router.replace 안 부름
        title="정산 그룹"
      />

      <FlatList
        data={groups}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 28,
          gap: 12,
        }}
        ListHeaderComponent={
          <View className="mb-4">
            <GradientCard>
              <Text className="text-white text-xl font-semibold mb-1">
                안녕하세요, {greetingName}님!
              </Text>
              <Text className="text-indigo-100 mb-5">
                현재 {groups.length}개의 정산 그룹이 있습니다
              </Text>
              <Pressable
                onPress={handleCreate}
                className="flex-row items-center gap-2 px-4 py-2 rounded-2xl bg-white"
              >
                <Plus color="#4f46e5" size={16} />
                <Text className="text-indigo-600 font-semibold">
                  새 그룹 만들기
                </Text>
              </Pressable>
            </GradientCard>

            <View className="mt-2 rounded-3xl p-5 bg-slate-50 border border-slate-100" />
            <Text className="mb-3 text-slate-700">내 그룹 목록</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="rounded-2xl p-4 bg-white shadow-lg"
            style={{ elevation: 3 }}
            onPress={() => {
              setCurrentGroup(item);
              router.push("/expenses");
            }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-center gap-2 flex-1 pr-2">
                <View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center">
                  <Users color="#4f46e5" size={20} />
                </View>
                <Text className="text-base font-semibold text-slate-900">
                  {item.name}
                </Text>
              </View>
              <Pressable
                onPress={() => handleDelete(item.id)}
                className="p-2 rounded-xl"
              >
                <Trash2 color="#ef4444" />
              </Pressable>
            </View>

            <Text className="text-slate-500 mt-2">
              생성일: {item.createdAt}
            </Text>

            <View className="flex-row flex-wrap gap-2 mt-3">
              {item.members.slice(0, 3).map((m) => (
                <View
                  key={m}
                  className="px-2 py-1 rounded-xl bg-indigo-50 border border-indigo-100"
                >
                  <Text className="text-indigo-700 text-xs">{m}</Text>
                </View>
              ))}
              {item.members.length > 3 && (
                <View className="px-2 py-1 rounded-xl bg-slate-100">
                  <Text className="text-slate-600 text-xs">
                    +{item.members.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
