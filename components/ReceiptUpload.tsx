import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import type { Expense } from "./ExpenseList";

type ParsedItem = {
  id: string;
  name: string;
  price: number;
  participants: string[];
};

const OCR_URL =
  "https://settlment-app-production.up.railway.app/api/v1/ocr/parse";

export default function ReceiptUpload({
  groupId,
  groupMembers,
  currentUserId,
  currentUserName,
  onAddExpense,
  authToken,
}: {
  groupId: string;
  groupMembers: string[];
  currentUserId: string;
  currentUserName: string;
  onAddExpense: (e: Expense) => void;
  authToken?: string | null;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payer, setPayer] = useState(currentUserName);
  const [storeName, setStoreName] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<ParsedItem[]>([]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) {
      const asset = res.assets[0];
      setImageUri(asset.uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Toast.show({ type: "error", text1: "카메라 권한이 필요합니다" });
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!res.canceled) {
      const asset = res.assets[0];
      setImageUri(asset.uri);
    }
  };

  const process = async () => {
    if (!imageUri) {
      return Toast.show({
        type: "error",
        text1: "먼저 이미지를 업로드하세요",
      });
    }
    try {
      setIsProcessing(true);
      const form = new FormData();
      form.append("file", {
        // @ts-ignore
        uri: imageUri,
        name: "receipt.jpg",
        type: "image/jpeg",
      });
      const res = await fetch(OCR_URL, {
        method: "POST",
        headers: { Accept: "*/*" },
        body: form,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "OCR 실패");
      }
      const data = await res.json();
      setStoreName(data.storeName || "");
      setTransactionDate(data.transactionDate || transactionDate);
      const parsed: ParsedItem[] = (data.items || []).map(
        (it: any, idx: number) => ({
          id: String(idx + 1),
          name: it.name || `항목 ${idx + 1}`,
          price: Number(it.price || it.amount || 0),
          participants: [...groupMembers], // 기본 전체 참여
        })
      );
      setItems(parsed);
      Toast.show({ type: "success", text1: "OCR 완료" });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "OCR 오류",
        text2: e?.message?.slice(0, 120),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleParticipant = (itemId: string, member: string) => {
    setItems((arr) =>
      arr.map((it) =>
        it.id !== itemId
          ? it
          : {
              ...it,
              participants: it.participants.includes(member)
                ? it.participants.filter((x) => x !== member)
                : [...it.participants, member],
            }
      )
    );
  };

  const submit = async () => {
    if (!items.length) {
      return Toast.show({ type: "error", text1: "항목이 없습니다" });
    }
    if (!authToken) {
      return Toast.show({ type: "error", text1: "로그인 토큰이 없습니다" });
    }

    setIsSubmitting(true);
    const payload = {
      groupId,
      payerId: currentUserId,
      storeName: storeName || "미지정",
      transactionDate,
      totalAmount: items.reduce((s, i) => s + i.price, 0),
      items: items.map((i) => ({
        name: i.name,
        price: i.price,
        participants: i.participants.length ? i.participants : groupMembers,
      })),
    };

    try {
      const res = await fetch(
        "https://settlment-app-production.up.railway.app/api/v1/receipts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "지출 등록 실패");
      }
      const saved = await res.json();
      const expense: Expense = {
        id: String(saved.id),
        date: saved.transactionDate || transactionDate,
        payer: payer,
        items: saved.items.map((it: any, idx: number) => ({
          id: String(idx),
          name: it.name,
          price: it.price,
          participants: it.participants || [],
        })),
        total: saved.totalAmount,
      };
      onAddExpense(expense);
      Toast.show({ type: "success", text1: "지출이 등록되었습니다" });
      router.replace("/expenses");
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "등록 실패",
        text2: e?.message?.slice(0, 120),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="gap-4">
      {!imageUri ? (
        <View className="gap-3">
          <Pressable
            onPress={takePhoto}
            className="rounded-2xl p-16 items-center bg-indigo-600"
          >
            <Text className="text-white font-semibold">카메라로 촬영</Text>
            <Text className="text-indigo-100 mt-1 text-sm">
              영수증을 직접 찍어 업로드
            </Text>
          </Pressable>
          <Pressable
            onPress={pickImage}
            className="rounded-2xl p-16 items-center bg-slate-50 border border-slate-200"
          >
            <Text className="text-slate-700">앨범에서 선택</Text>
            <Text className="text-slate-500 mt-1 text-sm">
              저장된 영수증 불러오기
            </Text>
          </Pressable>
        </View>
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
            style={{ opacity: isProcessing ? 0.85 : 1 }}
          >
            <Text className="text-white font-semibold">
              {isProcessing ? "처리 중..." : "OCR 분석 시작"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setImageUri(null);
              setItems([]);
            }}
            className="h-11 rounded-xl items-center justify-center bg-white border border-slate-200"
          >
            <Text className="text-slate-700">다시 선택</Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-slate-700">가게 이름</Text>
            <TextInput
              value={storeName}
              onChangeText={setStoreName}
              className="h-11 px-3 rounded-xl bg-slate-100"
            />
            <Text className="text-slate-700 mt-2">결제일</Text>
            <TextInput
              value={transactionDate}
              onChangeText={setTransactionDate}
              className="h-11 px-3 rounded-xl bg-slate-100"
            />
          </View>

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

          <View className="gap-3">
            {items.map((it) => (
              <View key={it.id} className="bg-slate-50 rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold">{it.name}</Text>
                  <Text className="text-slate-700">
                    {it.price.toLocaleString()}원
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row gap-2"
                >
                  {groupMembers.map((m) => {
                    const sel = it.participants.includes(m);
                    return (
                      <Pressable
                        key={m}
                        onPress={() => toggleParticipant(it.id, m)}
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
                </ScrollView>
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
            disabled={isSubmitting}
            className="h-12 rounded-2xl items-center justify-center bg-indigo-600"
            style={{ opacity: isSubmitting ? 0.85 : 1 }}
          >
            <Text className="text-white font-semibold">
              {isSubmitting ? "등록 중..." : "지출 등록"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setImageUri(null);
              setItems([]);
              setStoreName("");
              setTransactionDate(new Date().toISOString().split("T")[0]);
            }}
            className="h-11 rounded-xl items-center justify-center bg-white border border-slate-200"
          >
            <Text className="text-slate-700">다시하기</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
