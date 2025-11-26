import { Redirect, router, useRootNavigationState } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Calculator, Plus, Trash2 } from "lucide-react-native";
import Toast from "react-native-toast-message";
import AddExpenseModal from "../components/AddExpenseModal";
import ExpenseList, { Expense } from "../components/ExpenseList";
import { useAppState } from "../lib/app-state";

export default function Expenses() {
  const { currentUser, currentGroup, setCurrentGroup, auth } = useAppState();
  const rootNav = useRootNavigationState();
  const [showAdd, setShowAdd] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [confirmMemberId, setConfirmMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentGroup?.id) return;
    const fetchReceipts = async () => {
      setLoading(true);
      try {
        const resp = await fetch(
          `https://settlment-app-production.up.railway.app/api/v1/groups/${currentGroup.id}/receipts`,
          { headers: { accept: "*/*" } }
        );
        if (!resp.ok) {
          const message = await resp.text();
          throw new Error(message || "영수증을 불러오지 못했습니다");
        }
        const data = await resp.json();
        const normalized: Expense[] = (data || []).map((r: any, idx: number) => {
          const items =
            Array.isArray(r.items) && r.items.length
              ? r.items.map((it: any, i: number) => ({
                  id: `${r.id ?? idx}-item-${i}`,
                  name: it.name || `항목 ${i + 1}`,
                  price: Number(it.price ?? it.amount ?? 0),
                  participants: (it.participants || []).map((p: any) =>
                    String(p)
                  ),
                }))
              : [
                  {
                    id: `${r.id ?? idx}-item-0`,
                    name: r.storeName || r.title || r.name || "영수증",
                    price: Number(r.totalAmount ?? r.total ?? r.amount ?? 0),
                    participants: [],
                  },
                ];

          const total =
            r.totalAmount !== undefined && r.totalAmount !== null
              ? Number(r.totalAmount)
              : items.reduce((s, it) => s + (it.price || 0), 0);
          const payer = String(
            r.payerId ?? r.payer ?? r.owner ?? "알 수 없음"
          );
          const created =
            r.transactionDate || r.createdAt || r.date || new Date().toISOString();
          return {
            id: String(r.id ?? idx),
            date: created.split("T")[0],
            payer,
            items,
            total,
          };
        });
        setExpenses(normalized);
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "조회 실패",
          text2: err instanceof Error ? err.message : "다시 시도해주세요",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [currentGroup?.id]);

  if (!rootNav?.key) return null;
  if (!currentUser) return <Redirect href="/auth" />;
  if (!currentGroup) return <Redirect href="/groups" />;

  const totalAmount = expenses.reduce((a, b) => a + b.total, 0);
  const onAddExpense = (e: Expense) => setExpenses((prev) => [e, ...prev]);

  const openDetail = async (id: string) => {
    setDetailId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const resp = await fetch(
        `https://settlment-app-production.up.railway.app/api/v1/receipts/${id}`,
        { headers: { accept: "*/*" } }
      );
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "영수증 상세를 불러오지 못했습니다");
      }
      const data = await resp.json();
      setDetail(data);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "상세 조회 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!auth.accessToken) {
      Toast.show({ type: "error", text1: "로그인 토큰이 없습니다" });
      return;
    }
    if (!currentGroup?.id) return;
    setRemovingMemberId(memberId);
    try {
      const resp = await fetch(
        `https://settlment-app-production.up.railway.app/api/v1/groups/${currentGroup.id}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "멤버 삭제에 실패했습니다");
      }
      setCurrentGroup({
        ...currentGroup,
        members: currentGroup.members.filter((m) => m !== memberId),
      });
      Toast.show({ type: "success", text1: "멤버가 삭제되었습니다" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "삭제 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setRemovingMemberId(null);
      setConfirmMemberId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Pressable
        onPress={() => {
          setCurrentGroup(null);
          router.replace("/groups");
        }}
        className="mt-2 mb-4 ml-4 w-24"
      >
        <View className="flex-row items-center gap-2">
          <ArrowLeft color="#334155" />
          <Text className="text-slate-700">뒤로가기</Text>
        </View>
      </Pressable>

      <View className="flex-row items-center justify-between mb-4 px-6">
        <View>
          <Text className="text-xl font-semibold">{currentGroup.name}</Text>
          <Text className="text-slate-600 mt-1">
            총지출 {totalAmount.toLocaleString()}원
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
        onPress={() => setMemberModalOpen(true)}
        className="mx-6 h-11 rounded-2xl items-center justify-center bg-white border border-slate-200 mb-4"
      >
        <Text className="text-slate-700 font-semibold">멤버 관리</Text>
      </Pressable>

      <Pressable
        onPress={() => setShowAdd(true)}
        className="mx-6 h-12 rounded-2xl items-center justify-center bg-indigo-600 mb-6"
      >
        <View className="flex-row items-center gap-2">
          <Plus color="white" size={18} />
          <Text className="text-white font-semibold">지출 추가</Text>
        </View>
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {loading ? (
          <View className="bg-white rounded-2xl p-16 items-center">
            <Text className="text-slate-500">불러오는 중...</Text>
          </View>
        ) : (
          <ExpenseList expenses={expenses} onSelect={openDetail} />
        )}
      </ScrollView>

      <Modal
        visible={showAdd}
        animationType="slide"
        onRequestClose={() => setShowAdd(false)}
      >
        <AddExpenseModal
          members={currentGroup.members}
          groupId={currentGroup.id}
          authToken={auth.accessToken}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
          onClose={() => setShowAdd(false)}
          onAddExpense={onAddExpense}
        />
      </Modal>

      <Modal
        visible={!!detailId}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailId(null)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-md bg-white rounded-2xl p-4 gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-slate-900">
                영수증 상세
              </Text>
              <Pressable onPress={() => setDetailId(null)}>
                <Text className="text-slate-500">닫기</Text>
              </Pressable>
            </View>
            {detailLoading || !detail ? (
              <View className="py-6 items-center">
                <Text className="text-slate-500">
                  {detailLoading ? "불러오는 중..." : "데이터가 없습니다"}
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                <Text className="text-slate-900 font-semibold">
                  {detail.storeName || "영수증"}
                </Text>
                <Text className="text-slate-600 text-sm">
                  날짜: {detail.transactionDate}
                </Text>
                <Text className="text-slate-600 text-sm">
                  결제자 ID: {detail.payerId}
                </Text>
                <Text className="text-slate-600 text-sm">
                  총액: {detail.totalAmount?.toLocaleString()}원
                </Text>
                <View className="mt-2 gap-2">
                  {(detail.items || []).map((it: any, idx: number) => (
                    <View
                      key={`${detail.id}-it-${idx}`}
                      className="p-3 bg-slate-50 rounded-xl"
                    >
                      <Text className="text-slate-900">{it.name}</Text>
                      <Text className="text-slate-600 text-sm">
                        금액: {it.price?.toLocaleString()}원
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        참여자 {(it.participants || []).join(", ")}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={memberModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMemberModalOpen(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-md bg-white rounded-2xl p-4 gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-slate-900">
                멤버 관리
              </Text>
              <Pressable onPress={() => setMemberModalOpen(false)}>
                <Text className="text-slate-500">닫기</Text>
              </Pressable>
            </View>
            <View className="gap-2">
              {currentGroup.members.map((m) => (
                <View
                  key={m}
                  className="flex-row items-center justify-between bg-slate-50 rounded-xl p-3"
                >
                  <Text className="text-slate-900">{m}</Text>
                  {m !== currentUser.id && (
                    <Pressable
                      className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center gap-2"
                      onPress={() => setConfirmMemberId(m)}
                      disabled={removingMemberId === m}
                      style={{ opacity: removingMemberId === m ? 0.6 : 1 }}
                    >
                      {removingMemberId === m ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                      ) : (
                        <>
                          <Trash2 color="#ef4444" size={14} />
                          <Text className="text-rose-600 text-sm">삭제</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!confirmMemberId}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmMemberId(null)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-md bg-white rounded-2xl p-4 gap-3">
            <Text className="text-lg font-semibold text-slate-900">
              멤버 삭제
            </Text>
            <Text className="text-slate-600">
              "{confirmMemberId}" 멤버를 삭제할까요?
            </Text>
            <View className="flex-row justify-end gap-2">
              <Pressable
                className="px-4 py-2 rounded-xl bg-slate-100"
                onPress={() => setConfirmMemberId(null)}
                disabled={removingMemberId !== null}
                style={{ opacity: removingMemberId ? 0.6 : 1 }}
              >
                <Text className="text-slate-700">취소</Text>
              </Pressable>
              <Pressable
                className="px-4 py-2 rounded-xl bg-rose-600"
                onPress={() => {
                  if (confirmMemberId) handleRemoveMember(confirmMemberId);
                }}
                disabled={removingMemberId !== null}
                style={{ opacity: removingMemberId ? 0.7 : 1 }}
              >
                {removingMemberId ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">삭제</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
