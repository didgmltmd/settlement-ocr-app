import { router } from "expo-router";
import { ArrowLeft, Calculator, Plus } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import AddExpenseModal from "../components/AddExpenseModal";
import ExpenseList, { Expense } from "../components/ExpenseList";
import { useAppState } from "../lib/app-state";

export default function Expenses() {
  const { currentUser, currentGroup, setCurrentGroup } = useAppState();
  const [showAdd, setShowAdd] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      date: "2025-11-02",
      payer: "홍길동",
      items: [
        {
          id: "1-1",
          name: "삼겹살",
          price: 40000,
          participants: ["홍길동", "김철수", "이영희"],
        },
        {
          id: "1-2",
          name: "소주",
          price: 10000,
          participants: ["홍길동", "김철수"],
        },
      ],
      total: 50000,
    },
    {
      id: "2",
      date: "2025-11-01",
      payer: "김철수",
      items: [
        {
          id: "2-1",
          name: "택시",
          price: 15000,
          participants: ["홍길동", "김철수", "이영희", "박민수"],
        },
      ],
      total: 15000,
    },
  ]);

  if (!currentUser) {
    router.replace("/auth");
    return null;
  }
  if (!currentGroup) {
    router.replace("/groups");
    return null;
  }

  const totalAmount = expenses.reduce((a, b) => a + b.total, 0);
  const onAddExpense = (e: Expense) => setExpenses((prev) => [e, ...prev]);

  return (
    <View className="flex-1 pt-14 px-6">
      <Pressable
        onPress={() => {
          setCurrentGroup(null);
          router.replace("/groups");
        }}
        className="mb-4 w-24"
      >
        <View className="flex-row items-center gap-2">
          <ArrowLeft color="#334155" />
          <Text className="text-slate-700">뒤로가기</Text>
        </View>
      </Pressable>

      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-xl font-semibold">{currentGroup.name}</Text>
          <Text className="text-slate-600 mt-1">
            총 지출 {totalAmount.toLocaleString()}원
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/settlement")}
          className="px-3 py-2 rounded-xl bg-white border border-indigo-200"
        >
          <View className="flex-row items-center gap-2">
            <Calculator color="#4338ca" size={16} />
            <Text className="text-indigo-700 font-semibold">정산하기</Text>
          </View>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setShowAdd(true)}
        className="h-12 rounded-2xl items-center justify-center bg-indigo-600 mb-6"
      >
        <View className="flex-row items-center gap-2">
          <Plus color="white" size={18} />
          <Text className="text-white font-semibold">지출 추가</Text>
        </View>
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ExpenseList expenses={expenses} />
      </ScrollView>

      <Modal
        visible={showAdd}
        animationType="slide"
        onRequestClose={() => setShowAdd(false)}
      >
        <AddExpenseModal
          members={currentGroup.members}
          currentUserName={currentUser.name}
          onClose={() => setShowAdd(false)}
          onAddExpense={onAddExpense}
        />
      </Modal>
    </View>
  );
}
