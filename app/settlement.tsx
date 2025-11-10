import { router } from "expo-router";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAppState } from "../lib/app-state";

type Tx = { from: string; to: string; amount: number };

export default function Settlement() {
  const { currentUser, currentGroup } = useAppState();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!currentGroup) return;
    // 목업 수지/정산
    const mock = { 홍길동: -15000, 김철수: 8000, 이영희: 5000, 박민수: 2000 };
    setBalances(mock);

    const debtors = Object.entries(mock)
      .filter(([_, v]) => v > 0)
      .map(([n, v]) => ({ n, v }))
      .sort((a, b) => b.v - a.v);
    const creditors = Object.entries(mock)
      .filter(([_, v]) => v < 0)
      .map(([n, v]) => ({ n, v: -v }))
      .sort((a, b) => b.v - a.v);
    const res: Tx[] = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amt = Math.min(debtors[i].v, creditors[j].v);
      res.push({ from: debtors[i].n, to: creditors[j].n, amount: amt });
      debtors[i].v -= amt;
      creditors[j].v -= amt;
      if (debtors[i].v === 0) i++;
      if (creditors[j].v === 0) j++;
    }
    setTxs(res);
  }, [currentGroup]);

  if (!currentUser) {
    router.replace("/auth");
    return null;
  }
  if (!currentGroup) {
    router.replace("/groups");
    return null;
  }

  return (
    <View className="flex-1 pt-14 px-6">
      <Pressable onPress={() => router.back()} className="mb-4 w-24">
        <View className="flex-row items-center gap-2">
          <ArrowLeft color="#334155" />
          <Text className="text-slate-700">뒤로가기</Text>
        </View>
      </Pressable>

      <Text className="text-xl font-semibold mb-2">
        {currentGroup.name} - 정산 결과
      </Text>
      <View className="flex-row items-center gap-2 mb-6">
        <CheckCircle color="#16a34a" />
        <Text className="text-slate-600">
          최소{" "}
          <Text className="text-indigo-600 font-semibold">{txs.length}번</Text>
          의 송금으로 정산 완료
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-white rounded-2xl p-4 mb-8">
          <Text className="font-semibold mb-3">멤버별 수지</Text>
          <View className="gap-3">
            {Object.entries(balances).map(([name, bal]) => (
              <View
                key={name}
                className="flex-row items-center justify-between bg-slate-50 rounded-xl p-3"
              >
                <Text>{name}</Text>
                <Text
                  className={`px-3 py-1 rounded-full ${
                    bal < 0
                      ? "bg-emerald-500 text-white"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {bal < 0
                    ? `${(-bal).toLocaleString()}원 받음`
                    : `${bal.toLocaleString()}원 냄`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text className="text-slate-900 mb-3">송금 내역</Text>
        {txs.length === 0 ? (
          <View className="bg-white rounded-2xl p-14 items-center">
            <CheckCircle color="#16a34a" size={36} />
            <Text className="mt-3 font-semibold">정산이 완료되었습니다!</Text>
            <Text className="text-slate-600 mt-1">
              모든 지출이 균등하게 분배되었어요
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {txs.map((t, idx) => (
              <View key={idx} className="bg-white rounded-2xl overflow-hidden">
                <View className="flex-row">
                  <View className="flex-1 p-4 bg-rose-50">
                    <Text className="text-slate-600 text-xs mb-1">
                      보내는 사람
                    </Text>
                    <Text className="font-semibold">{t.from}</Text>
                  </View>
                  <View className="items-center justify-center px-4 bg-slate-50">
                    <ArrowRight color="#4338ca" />
                    <Text className="mt-1 text-indigo-700">
                      {t.amount.toLocaleString()}원
                    </Text>
                  </View>
                  <View className="flex-1 p-4 bg-emerald-50">
                    <Text className="text-slate-600 text-xs mb-1">
                      받는 사람
                    </Text>
                    <Text className="font-semibold">{t.to}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="bg-indigo-50 rounded-2xl p-4 mt-8">
          <Text className="text-indigo-900 text-sm">
            💡 최소 송금 횟수로 정산되도록 그리디 알고리즘을 적용했습니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
