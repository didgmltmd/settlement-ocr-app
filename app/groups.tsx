import { Redirect, router } from "expo-router";
import { Mail, Plus, Trash2, UserPlus, Users } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import GradientCard from "../components/GradientCard";
import HeaderWithMenu from "../components/HeaderWithMenu";
import { useAppState } from "../lib/app-state";

type Group = { id: string; name: string; members: string[] };
type Invite = {
  id: string;
  groupId: string;
  groupName?: string;
  inviterId: string;
  inviterNickname?: string;
  inviteeId?: string;
  status: string;
  createdAt?: string;
};

export default function Groups() {
  const { currentUser, auth, setCurrentGroup, logout } = useAppState();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [inviteNickname, setInviteNickname] = useState("");
  const [inviteTarget, setInviteTarget] = useState<Group | null>(null);
  const [inviting, setInviting] = useState(false);

  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [invitesOpen, setInvitesOpen] = useState(false);
  const [inviteListLoading, setInviteListLoading] = useState(false);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);

  const greetingName = useMemo(
    () => (currentUser?.name ? currentUser.name : "친구"),
    [currentUser]
  );

  const fetchGroups = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = { accept: "*/*" };
      if (auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`;
      const resp = await fetch(
        `https://settlment-app-production.up.railway.app/api/v1/groups/user/${currentUser.id}`,
        { headers }
      );
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "그룹을 불러오지 못했습니다");
      }
      const data = await resp.json();
      const normalized: Group[] = (data || []).map((g: any) => ({
        id: String(g.id),
        name: g.name,
        members: Object.keys(g.members || {}),
      }));
      setGroups(normalized);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "그룹 로드 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvites = async () => {
    if (!auth.accessToken) {
      Toast.show({ type: "error", text1: "로그인 토큰이 없습니다" });
      return;
    }
    setInviteListLoading(true);
    try {
      const resp = await fetch(
        "https://settlment-app-production.up.railway.app/api/v1/invitations/pending",
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "초대 목록을 불러오지 못했습니다");
      }
      const data = await resp.json();
      const normalized: Invite[] = (data || []).map((i: any) => ({
        id: String(i.invitationId ?? i.id),
        groupId: String(i.groupId),
        groupName: i.groupName,
        inviterId: String(i.inviterId),
        inviterNickname: i.inviterNickname,
        inviteeId: i.inviteeId ? String(i.inviteeId) : undefined,
        status: i.status,
        createdAt: i.createdAt,
      }));
      setPendingInvites(normalized);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "초대 조회 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setInviteListLoading(false);
    }
  };

  const handleCreate = async () => {
    const name = newGroupName.trim();
    if (!name) {
      Toast.show({ type: "error", text1: "그룹 이름을 입력해주세요" });
      return;
    }
    if (!auth.accessToken) {
      Toast.show({ type: "error", text1: "로그인 토큰이 없습니다" });
      return;
    }
    setCreating(true);
    try {
      const resp = await fetch(
        "https://settlment-app-production.up.railway.app/api/v1/groups",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({ name }),
        }
      );
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "그룹 생성에 실패했습니다");
      }
      const data = await resp.json();
      const created: Group = {
        id: String(data.id),
        name: data.name,
        members: Object.keys(data.members || {}),
      };
      setGroups((gs) => [created, ...gs]);
      setNewGroupName("");
      Toast.show({ type: "success", text1: "그룹이 생성되었습니다" });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "그룹 생성 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    const nickname = inviteNickname.trim();
    if (!inviteTarget?.id || !nickname) {
      Toast.show({ type: "error", text1: "초대할 닉네임을 입력해주세요" });
      return;
    }
    if (!currentUser?.id) {
      Toast.show({ type: "error", text1: "로그인 정보가 없습니다" });
      return;
    }
    if (!auth.accessToken) {
      Toast.show({ type: "error", text1: "로그인 토큰이 없습니다" });
      return;
    }
    setInviting(true);
    try {
      const resp = await fetch(
        "https://settlment-app-production.up.railway.app/api/v1/invitations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({
            groupId: inviteTarget.id,
            inviterId: currentUser.id,
            inviteeNickname: nickname,
          }),
        }
      );
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "초대에 실패했습니다");
      }
      Toast.show({ type: "success", text1: "초대가 전송되었습니다" });
      setInviteNickname("");
      setInviteTarget(null);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "초대 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleInviteAction = async (inviteId: string, action: "accept" | "reject") => {
    if (!auth.accessToken) {
      Toast.show({ type: "error", text1: "로그인 토큰이 없습니다" });
      return;
    }
    setInviteActionId(inviteId);
    try {
      const resp = await fetch(
        `https://settlment-app-production.up.railway.app/api/v1/invitations/${inviteId}/${action}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || `초대 ${action === "accept" ? "수락" : "거절"} 실패`);
      }
      Toast.show({
        type: "success",
        text1: action === "accept" ? "초대를 수락했습니다" : "초대를 거절했습니다",
      });
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      if (action === "accept") {
        fetchGroups();
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "요청 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setInviteActionId(null);
    }
  };

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  if (!currentUser) return <Redirect href="/auth" />;

  return (
    <SafeAreaView className="flex-1">
      <HeaderWithMenu
        username={currentUser.name}
        onLogout={logout}
        title="정산 그룹"
        rightSlot={
          <Pressable
            onPress={() => {
              setInvitesOpen(true);
              fetchPendingInvites();
            }}
            className="w-9 h-9 rounded-full items-center justify-center bg-white"
          >
            <Mail color="#4f46e5" size={18} />
          </Pressable>
        }
      />

      <FlatList
        data={groups}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchGroups} />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 28,
          gap: 12,
        }}
        ListHeaderComponent={
          <View className="mb-4 mt-4">
            <GradientCard>
              <Text className="text-white text-xl font-semibold mb-1">
                안녕하세요, {greetingName}님
              </Text>
              <Text className="text-indigo-100 mb-4">
                현재 {groups.length}개의 정산 그룹이 있습니다
              </Text>
              <View className="bg-white rounded-2xl p-3 gap-2">
                <TextInput
                  placeholder="새 그룹 이름을 입력하세요"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  className="h-11 px-3 rounded-xl bg-slate-100"
                  placeholderTextColor="#94a3b8"
                />
                <Pressable
                  onPress={handleCreate}
                  disabled={creating}
                  className="flex-row items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600"
                  style={{ opacity: creating ? 0.75 : 1 }}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Plus color="white" size={16} />
                  )}
                  <Text className="text-white font-semibold">
                    {creating ? "생성 중..." : "그룹 만들기"}
                  </Text>
                </Pressable>
              </View>
            </GradientCard>

            <View className="mt-2 rounded-3xl p-5 bg-slate-50 border border-slate-100" />
            <Text className="mb-3 text-slate-700">내 그룹 목록</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            {loading ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              <Text className="text-slate-500">그룹이 없습니다.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="rounded-2xl p-4 bg-white shadow-lg"
            style={{ elevation: 3 }}
            onPress={() => {
              setCurrentGroup(item);
              router.push("/expenses");
            }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-center gap-2 flex-1 pr-2">
                <View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center">
                  <Users color="#4f46e5" size={20} />
                </View>
                <Text className="text-base font-semibold text-slate-900">
                  {item.name}
                </Text>
              </View>
              <Pressable className="p-2 rounded-xl opacity-40">
                <Trash2 color="#cbd5e1" />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-3">
              {item.members.slice(0, 3).map((m) => (
                <View
                  key={m}
                  className="px-2 py-1 rounded-xl bg-indigo-50 border border-indigo-100"
                >
                  <Text className="text-indigo-700 text-xs">{m}</Text>
                </View>
              ))}
              {item.members.length > 3 && (
                <View className="px-2 py-1 rounded-xl bg-slate-100">
                  <Text className="text-slate-600 text-xs">
                    +{item.members.length - 3}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row justify-end items-center gap-3 mt-3">
              <Pressable
                className="p-2 rounded-xl bg-purple-50 border border-purple-100"
                onPress={() => {
                  setInviteTarget(item);
                  setInviteNickname("");
                }}
              >
                <UserPlus color="#7c3aed" size={18} />
              </Pressable>
              <Pressable className="p-2 rounded-xl opacity-40">
                <Trash2 color="#cbd5e1" />
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      {/* Send Invitation Modal */}
      <Modal visible={!!inviteTarget} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-md bg-white rounded-2xl p-4 gap-3">
            <Text className="text-lg font-semibold text-slate-900">
              초대 보내기
            </Text>
            <Text className="text-slate-600">
              그룹: {inviteTarget?.name} (ID: {inviteTarget?.id})
            </Text>
            <TextInput
              placeholder="초대할 닉네임"
              value={inviteNickname}
              onChangeText={setInviteNickname}
              className="h-11 px-3 rounded-xl bg-slate-100"
              placeholderTextColor="#94a3b8"
            />
            <View className="flex-row justify-end gap-2">
              <Pressable
                className="px-4 py-2 rounded-xl bg-slate-100"
                onPress={() => {
                  setInviteTarget(null);
                  setInviteNickname("");
                }}
              >
                <Text className="text-slate-700">취소</Text>
              </Pressable>
              <Pressable
                className="px-4 py-2 rounded-xl bg-purple-600"
                onPress={handleInvite}
                disabled={inviting}
                style={{ opacity: inviting ? 0.75 : 1 }}
              >
                {inviting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold">초대하기</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pending Invitations Modal */}
      <Modal visible={invitesOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-md bg-white rounded-2xl p-4 gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-slate-900">
                받은 초대
              </Text>
              <Pressable onPress={() => setInvitesOpen(false)}>
                <Text className="text-slate-500">닫기</Text>
              </Pressable>
            </View>
            {inviteListLoading ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#4f46e5" />
              </View>
            ) : pendingInvites.length === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-slate-500">대기 중인 초대가 없습니다.</Text>
              </View>
            ) : (
              pendingInvites.map((inv) => (
                <View
                  key={inv.id}
                  className="p-3 border border-slate-200 rounded-xl mb-2"
                >
                  <Text className="text-slate-900 font-semibold">
                    그룹: {inv.groupName || inv.groupId} (ID: {inv.groupId})
                  </Text>
                  <Text className="text-slate-600 text-xs mt-1">
                    초대한 사람: {inv.inviterNickname || inv.inviterId}
                  </Text>
                  <Text className="text-slate-500 text-xs mt-1">
                    상태: {inv.status}
                  </Text>
                  <View className="flex-row gap-2 justify-end mt-2">
                    <Pressable
                      className="px-3 py-2 rounded-lg bg-slate-100"
                      onPress={() => handleInviteAction(inv.id, "reject")}
                      disabled={inviteActionId === inv.id}
                      style={{
                        opacity: inviteActionId === inv.id ? 0.7 : 1,
                      }}
                    >
                      <Text className="text-slate-700">거절</Text>
                    </Pressable>
                    <Pressable
                      className="px-3 py-2 rounded-lg bg-indigo-600"
                      onPress={() => handleInviteAction(inv.id, "accept")}
                      disabled={inviteActionId === inv.id}
                      style={{
                        opacity: inviteActionId === inv.id ? 0.7 : 1,
                      }}
                    >
                      {inviteActionId === inv.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text className="text-white">수락</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
