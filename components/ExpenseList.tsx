import { Pressable, Text, View } from "react-native";

export type ExpenseItem = {
  id: string;
  name: string;
  price: number;
  participants: string[];
};
export type Expense = {
  id: string;
  date: string;
  payer: string;
  items: ExpenseItem[];
  total: number;
};

export default function ExpenseList({
  expenses,
  onSelect,
}: {
  expenses: Expense[];
  onSelect?: (id: string) => void;
}) {
  if (expenses.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-16 items-center">
        <Text className="text-slate-700">아직 지출 내역이 없습니다</Text>
        <Text className="text-slate-500 mt-1">영수증 OCR 또는 수동 입력</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {expenses.map((expense) => (
        <Pressable
          key={expense.id}
          className="bg-white rounded-2xl p-4"
          onPress={() => onSelect?.(expense.id)}
        >
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="font-semibold">{expense.date}</Text>
              <Text className="text-slate-500">결제자 {expense.payer}</Text>
            </View>
            <Text className="text-indigo-700 font-semibold">
              {expense.total.toLocaleString()}원
            </Text>
          </View>
          <View className="gap-3">
            {expense.items.map((it) => (
              <View
                key={it.id}
                className="flex-row items-start justify-between bg-slate-50 rounded-xl p-3"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-slate-900">{it.name}</Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    참여자 {it.participants.join(", ")}
                  </Text>
                </View>
                <View className="items-end">
                  <Text>{it.price.toLocaleString()}원</Text>
                  <Text className="text-xs text-slate-500">
                    1인당{" "}
                    {it.participants.length
                      ? Math.round(it.price / it.participants.length).toLocaleString()
                      : "-"}
                    원
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
