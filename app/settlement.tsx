import { router } from "expo-router";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAppState } from "../lib/app-state";

type Tx = {
  fromId: string;
  toId: string;
  fromName?: string;
  toName?: string;
  amount: number;
};

export default function Settlement() {
  const { currentUser, currentGroup, auth } = useAppState();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/auth");
      return;
    }
    if (!currentGroup) {
      router.replace("/groups");
      return;
    }

    const runSettlement = async () => {
      setLoading(true);
      try {
        const headersBase = auth.accessToken
          ? { Authorization: `Bearer ${auth.accessToken}` }
          : {};

        // 1) 그룹 영수증 조회
        const receiptsResp = await fetch(
          `https://settlment-app-production.up.railway.app/api/v1/groups/${currentGroup.id}/receipts`,
          { headers: { ...headersBase, accept: "*/*" } }
        );
        if (!receiptsResp.ok) {
          const msg = await receiptsResp.text();
          throw new Error(msg || "영수증 목록을 불러오지 못했습니다");
        }
        const receiptsData = await receiptsResp.json();
        const ids: string[] = (receiptsData || []).map((r: any) =>
          String(r.id)
        );
        if (!ids.length) throw new Error("정산할 영수증이 없습니다");

        // 2) 정산 생성
        const createResp = await fetch(
          "https://settlment-app-production.up.railway.app/api/v1/settlements",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headersBase,
            },
            body: JSON.stringify({
              settlementName: currentGroup.id,
              groupId: currentGroup.id,
            }),
          }
        );
        if (!createResp.ok) {
          const msg = await createResp.text();
          throw new Error(msg || "정산 생성에 실패했습니다");
        }
        const created = await createResp.json();
        const settlementId = created.settlementId;

        // 3) 계산 요청
        const calcResp = await fetch(
          `https://settlment-app-production.up.railway.app/api/v1/settlements/${settlementId}/calculate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headersBase,
            },
            body: JSON.stringify({ receiptIds: ids }),
          }
        );
        if (!calcResp.ok) {
          const msg = await calcResp.text();
          throw new Error(msg || "정산 계산에 실패했습니다");
        }
        const calc = await calcResp.json();
        const userBalances: Record<string, number> = calc.userBalances || {};
        const transactions: Tx[] = (calc.transactions || []).map((t: any) => {
          const fromId =
            t.fromUserId ??
            t.fromUser ??
            t.from ??
            t.senderId ??
            t.payerId ??
            t.sender ??
            t.payer;
          const toId =
            t.toUserId ??
            t.toUser ??
            t.to ??
            t.receiverId ??
            t.payeeId ??
            t.receiver ??
            t.payee;
          return {
            fromId: fromId != null ? String(fromId) : "",
            toId: toId != null ? String(toId) : "",
            fromName:
              t.fromUserName ??
              t.fromUserNickname ??
              t.senderName ??
              t.payerName ??
              t.fromName ??
              "",
            toName:
              t.toUserName ??
              t.toUserNickname ??
              t.receiverName ??
              t.payeeName ??
              t.toName ??
              "",
            amount: Number(t.amount ?? 0),
          };
        });

        setBalances(userBalances);
        setTxs(transactions);
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "정산 실패",
          text2: err instanceof Error ? err.message : "다시 시도해주세요",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    runSettlement();
  }, [auth.accessToken, currentGroup, currentUser]);

  if (!currentUser || !currentGroup) {
    return null;
  }

  const displayName = (id: string, fallbackName?: string) => {
    const name = (fallbackName || "").trim();
    if (name) return name;
    const cleanId = (id || "").trim();
    if (!cleanId) return "알 수 없음";
    if (cleanId === currentUser.id) return currentUser.name;
    return `사용자 ${cleanId}`;
  };

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
          {loading ? "정산 계산 중..." : "정산이 완료되었습니다"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-white rounded-2xl p-4 mb-8">
          <Text className="font-semibold mb-3">멤버 정산 요약</Text>
          {Object.keys(balances).length === 0 ? (
            <Text className="text-slate-500">잔액 정보가 없습니다</Text>
          ) : (
            <View className="gap-3">
              {Object.entries(balances).map(([id, bal]) => (
                <View
                  key={id}
                  className="flex-row items-center justify-between bg-slate-50 rounded-xl p-3"
                >
                  <Text>{displayName(id)}</Text>
                  <Text
                    className={`px-3 py-1 rounded-full ${
                      bal > 0
                        ? "bg-emerald-500 text-white"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {bal > 0
                      ? `${bal.toLocaleString()}원 받음`
                      : `${(-bal).toLocaleString()}원 보냄`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text className="text-slate-900 mb-3">송금 내역</Text>
        {txs.length === 0 ? (
          <View className="bg-white rounded-2xl p-14 items-center">
            <CheckCircle color="#16a34a" size={36} />
            <Text className="mt-3 font-semibold">정산이 완료되었습니다</Text>
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
                    <Text className="font-semibold">
                      {displayName(t.fromId, t.fromName)}
                    </Text>
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
                    <Text className="font-semibold">
                      {displayName(t.toId, t.toName)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
