import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import type { Expense } from "./ExpenseList";

type ManualItem = {
  id: string;
  name: string;
  price: string;
  participants: string[];
};

export default function ManualExpense({
  groupMembers,
  currentUser,
  onAddExpense,
}: {
  groupMembers: string[];
  currentUser: string;
  onAddExpense: (e: Expense) => void;
}) {
  const [payer, setPayer] = useState(currentUser);
  const [items, setItems] = useState<ManualItem[]>([
    { id: "1", name: "", price: "", participants: [] },
  ]);

  const addItem = () =>
    setItems((p) => [
      ...p,
      { id: Date.now().toString(), name: "", price: "", participants: [] },
    ]);
  const removeItem = (id: string) =>
    items.length === 1
      ? Toast.show({ type: "error", text1: "최소 1개의 항목이 필요합니다" })
      : setItems((p) => p.filter((i) => i.id !== id));

  const toggleParticipant = (id: string, m: string) =>
    setItems((arr) =>
      arr.map((it) =>
        it.id !== id
          ? it
          : {
              ...it,
              participants: it.participants.includes(m)
                ? it.participants.filter((x) => x !== m)
                : [...it.participants, m],
            }
      )
    );

  const submit = () => {
    for (const it of items) {
      if (!it.name.trim())
        return Toast.show({
          type: "error",
          text1: "모든 항목의 이름을 입력해주세요",
        });
      const n = Number(it.price);
      if (!n || n <= 0)
        return Toast.show({
          type: "error",
          text1: "올바른 금액을 입력해주세요",
        });
      if (it.participants.length === 0)
        return Toast.show({
          type: "error",
          text1: "모든 항목의 참여자를 선택해주세요",
        });
    }
    const total = items.reduce((s, it) => s + Number(it.price), 0);
    const exp: Expense = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      payer,
      items: items.map((it) => ({
        id: it.id,
        name: it.name,
        price: Number(it.price),
        participants: it.participants,
      })),
      total,
    };
    onAddExpense(exp);
    Toast.show({ type: "success", text1: "지출이 추가되었습니다" });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="gap-4">
      <View>
        <Text className="text-slate-700 mb-2">결제자</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-2"
        >
          {groupMembers.map((m) => (
            <Pressable
              key={m}
              onPress={() => setPayer(m)}
              className={`px-3 py-2 rounded-xl ${
                payer === m ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <Text className={payer === m ? "text-white" : "text-slate-700"}>
                {m}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {items.map((it) => (
        <View key={it.id} className="bg-slate-50 rounded-2xl p-4 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-slate-700 mb-2">항목명</Text>
              <TextInput
                className="h-11 px-4 bg-white rounded-xl"
                value={it.name}
                onChangeText={(v) =>
                  setItems((s) =>
                    s.map((x) => (x.id === it.id ? { ...x, name: v } : x))
                  )
                }
              />
            </View>
            <View className="w-40">
              <Text className="text-slate-700 mb-2">금액</Text>
              <TextInput
                className="h-11 px-4 bg-white rounded-xl"
                keyboardType="numeric"
                value={it.price}
                onChangeText={(v) =>
                  setItems((s) =>
                    s.map((x) => (x.id === it.id ? { ...x, price: v } : x))
                  )
                }
              />
            </View>
            {items.length > 1 && (
              <Pressable
                onPress={() => removeItem(it.id)}
                className="w-11 h-11 rounded-xl items-center justify-center bg-white self-end"
              >
                <Trash2 color="#ef4444" />
              </Pressable>
            )}
          </View>

          <View>
            <Text className="text-slate-700 mb-2">참여자 선택</Text>
            <View className="flex-row flex-wrap gap-2">
              {groupMembers.map((m) => {
                const sel = it.participants.includes(m);
                return (
                  <Pressable
                    key={m}
                    onPress={() => toggleParticipant(it.id, m)}
                    className={`px-3 py-2 rounded-xl ${
                      sel ? "bg-indigo-600" : "bg-white border border-slate-200"
                    }`}
                  >
                    <Text className={sel ? "text-white" : "text-slate-700"}>
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      ))}

      <Pressable
        onPress={addItem}
        className="h-11 rounded-xl items-center justify-center bg-white border border-indigo-200"
      >
        <Text className="text-indigo-700 font-semibold">항목 추가</Text>
      </Pressable>

      <View className="mt-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-700">총 금액</Text>
          <Text className="text-lg font-semibold text-indigo-700">
            {items
              .reduce((s, it) => s + (Number(it.price) || 0), 0)
              .toLocaleString()}
            원
          </Text>
        </View>
        <Pressable
          onPress={submit}
          className="h-12 rounded-2xl items-center justify-center bg-indigo-600"
        >
          <Text className="text-white font-semibold">지출 등록</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
