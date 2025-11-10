import { Camera, Plus, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Expense } from "./ExpenseList";
import ManualExpense from "./ManualExpense";
import ReceiptUpload from "./ReceiptUpload";

export default function AddExpenseModal({
  members,
  currentUserName,
  onClose,
  onAddExpense,
}: {
  members: string[];
  currentUserName: string;
  onClose: () => void;
  onAddExpense: (e: Expense) => void;
}) {
  const [tab, setTab] = useState<"ocr" | "manual">("ocr");

  return (
    <View className="flex-1 bg-white pt-14 px-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">지출 추가</Text>
        <Pressable onPress={onClose} className="p-2">
          <X />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row mb-4 rounded-xl overflow-hidden bg-slate-100">
        <Pressable
          onPress={() => setTab("ocr")}
          className={`flex-1 py-3 items-center ${
            tab === "ocr" ? "bg-white" : ""
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Camera size={16} />
            <Text>영수증 OCR</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setTab("manual")}
          className={`flex-1 py-3 items-center ${
            tab === "manual" ? "bg-white" : ""
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Plus size={16} />
            <Text>수동 입력</Text>
          </View>
        </Pressable>
      </View>

      {tab === "ocr" ? (
        <ReceiptUpload
          groupMembers={members}
          currentUser={currentUserName}
          onAddExpense={onAddExpense}
        />
      ) : (
        <ManualExpense
          groupMembers={members}
          currentUser={currentUserName}
          onAddExpense={onAddExpense}
        />
      )}
    </View>
  );
}
