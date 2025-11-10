import * as ImageManipulator from "expo-image-manipulator";
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

const OCR_URL =
  "https://settlment-app-production.up.railway.app/api/v1/ocr/parse";

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
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payer, setPayer] = useState(currentUser);
  const [items, setItems] = useState<ParsedItem[]>([]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled) {
      const asset = res.assets[0];
      const out = await manipulateToBase64(asset.uri);
      setImageUri(out.uri);
      setImageB64(out.base64);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted)
      return Toast.show({ type: "error", text1: "카메라 권한이 필요합니다" });
    const res = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!res.canceled) {
      const asset = res.assets[0];
      const out = await manipulateToBase64(asset.uri);
      setImageUri(out.uri);
      setImageB64(out.base64);
    }
  };

  // ❶ 이미지 리사이즈/압축 + base64 생성 (최대 1600px, JPEG)
  const manipulateToBase64 = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1600 } }], // 긴 변 기준 1600px 정도로 줄여 500 회피
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (!result.base64) throw new Error("base64 변환 실패");
    return { uri: result.uri, base64: result.base64 };
  };

  // ❷ JSON 방식 호출 (먼저 시도)
  const callOCRJson = async (b64: string) => {
    const r = await fetch(OCR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ file: `data:image/jpeg;base64,${b64}` }),
    });
    return r;
  };

  // ❸ multipart/form-data 방식 호출 (JSON 실패 시 재시도)
  const callOCRMultipart = async (uri: string) => {
    const form = new FormData();
    form.append("file", {
      // @ts-ignore React Native FormData file
      uri,
      name: "receipt.jpg",
      type: "image/jpeg",
    });
    const r = await fetch(OCR_URL, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
    });
    return r;
  };

  const process = async () => {
    if (!imageUri || !imageB64) {
      return Toast.show({
        type: "error",
        text1: "이미지를 먼저 업로드해주세요",
      });
    }

    try {
      setIsProcessing(true);

      // 1) JSON 우선
      let res = await callOCRJson(imageB64);
      // 1-1) JSON이 500 등 실패면 multipart 재시도
      if (!res.ok) {
        res = await callOCRMultipart(imageUri);
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`OCR 실패: ${res.status} ${txt}`);
      }

      const data = await res.json();

      // 서버 응답 매핑 (예: { items: [{ name, price }, ...] })
      const parsed: ParsedItem[] = (data?.items ?? []).map(
        (it: any, idx: number) => ({
          id: String(idx + 1),
          name: String(it?.name ?? `항목 ${idx + 1}`),
          price: Number(it?.price ?? 0),
          participants: [currentUser],
        })
      );

      if (!parsed.length) {
        Toast.show({
          type: "info",
          text1: "인식된 항목이 없습니다. 수동 입력을 이용하세요.",
        });
      }
      setItems(parsed);
      Toast.show({ type: "success", text1: "영수증 분석 완료!" });
    } catch (e: any) {
      console.warn(e);
      Toast.show({
        type: "error",
        text1: "OCR 오류",
        text2: e?.message?.slice(0, 120),
      });
    } finally {
      setIsProcessing(false);
    }
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
    if (items.some((i) => i.participants.length === 0)) {
      return Toast.show({
        type: "error",
        text1: "모든 항목의 참여자를 선택해주세요",
      });
    }
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
    setImageB64(null);
    setItems([]);
    setPayer(currentUser);
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
              탭하여 앨범 열기
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
          {/* 결제자 선택 */}
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

          {/* 항목/참여자 */}
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

          {/* 합계 + 제출 */}
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
