import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import type { Expense } from "./ExpenseList";

type ParsedItem = {
  id: string;
  name: string;
  price: number;
  participants: string[];
};

export default function ReceiptUpload({
  groupMembers,
  currentUser,
  onAddExpense,
}: {
  groupMembers: string[];
  currentUser: string;
  onAddExpense: (e: Expense) => void;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payer, setPayer] = useState(currentUser);
  const [items, setItems] = useState<ParsedItem[]>([]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const process = async () => {
    if (!imageUri)
      return Toast.show({
        type: "error",
        text1: "이미지를 먼저 업로드해주세요",
      });
    setIsProcessing(true);
    setTimeout(() => {
      setItems([
        {
          id: "1",
          name: "삼겹살 2인분",
          price: 32000,
          participants: [currentUser],
        },
        {
          id: "2",
          name: "소주 2병",
          price: 10000,
          participants: [currentUser],
        },
        {
          id: "3",
          name: "공기밥 2개",
          price: 4000,
          participants: [currentUser],
        },
        { id: "4", name: "콜라 1개", price: 3000, participants: [currentUser] },
      ]);
      setIsProcessing(false);
      Toast.show({ type: "success", text1: "영수증 분석 완료!" });
    }, 1200);
  };

  const toggle = (id: string, m: string) =>
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
    if (items.some((i) => i.participants.length === 0))
      return Toast.show({
        type: "error",
        text1: "모든 항목의 참여자를 선택해주세요",
      });
    const total = items.reduce((s, i) => s + i.price, 0);
    const exp: Expense = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      payer,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        participants: i.participants,
      })),
      total,
    };
    onAddExpense(exp);
    Toast.show({ type: "success", text1: "지출이 추가되었습니다" });
  };

  const reset = () => {
    setImageUri(null);
    setItems([]);
    setPayer(currentUser);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="gap-4">
      {!imageUri ? (
        <Pressable
          onPress={pickImage}
          className="rounded-2xl p-16 items-center bg-slate-50"
        >
          <Text className="text-slate-700">영수증 사진을 업로드하세요</Text>
          <Text className="text-slate-500 mt-1">탭하여 앨범 열기</Text>
        </Pressable>
      ) : items.length === 0 ? (
        <View className="gap-3">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-72 rounded-xl"
            resizeMode="contain"
          />
          <Pressable
            disabled={isProcessing}
            onPress={process}
            className="h-12 rounded-2xl items-center justify-center bg-indigo-600"
          >
            <Text className="text-white font-semibold">
              {isProcessing ? "처리 중..." : "OCR 분석 시작"}
            </Text>
          </Pressable>
          <Pressable
            onPress={reset}
            className="h-11 rounded-xl items-center justify-center bg-white border border-slate-200"
          >
            <Text className="text-slate-700">다시하기</Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-4">
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
                  <Text
                    className={payer === m ? "text-white" : "text-slate-700"}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View className="gap-3">
            {items.map((it) => (
              <View key={it.id} className="bg-slate-50 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold">{it.name}</Text>
                  <Text className="text-slate-700">
                    {it.price.toLocaleString()}원
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {groupMembers.map((m) => {
                    const sel = it.participants.includes(m);
                    return (
                      <Pressable
                        key={m}
                        onPress={() => toggle(it.id, m)}
                        className={`px-3 py-2 rounded-xl ${
                          sel
                            ? "bg-indigo-600"
                            : "bg-white border border-slate-200"
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
            ))}
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-slate-700">총 금액</Text>
            <Text className="text-lg font-semibold text-indigo-700">
              {items.reduce((s, i) => s + i.price, 0).toLocaleString()}원
            </Text>
          </View>

          <Pressable
            onPress={submit}
            className="h-12 rounded-2xl items-center justify-center bg-indigo-600"
          >
            <Text className="text-white font-semibold">지출 등록</Text>
          </Pressable>
          <Pressable
            onPress={reset}
            className="h-11 rounded-xl items-center justify-center bg-white border border-slate-200"
          >
            <Text className="text-slate-700">다시하기</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
