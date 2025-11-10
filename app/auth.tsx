import { router } from "expo-router";
import { Receipt } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAppState } from "../lib/app-state";

export default function Auth() {
  const { setCurrentUser } = useAppState();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const submitLogin = () => {
    if (!loginEmail || !loginPassword) {
      Toast.show({ type: "error", text1: "모든 필드를 입력해주세요" });
      return;
    }
    Toast.show({ type: "success", text1: "로그인 성공!" });
    setCurrentUser({ id: "1", name: loginEmail.split("@")[0] });
    router.replace("/groups");
  };

  const submitSignup = () => {
    if (!signupName || !signupEmail || !signupPassword) {
      Toast.show({ type: "error", text1: "모든 필드를 입력해주세요" });
      return;
    }
    Toast.show({ type: "success", text1: "회원가입 성공!" });
    setCurrentUser({ id: "1", name: signupName });
    router.replace("/groups");
  };

  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="items-center mb-8">
        <View className="bg-indigo-600 p-4 rounded-2xl">
          <Receipt size={36} color="white" />
        </View>
        <Text className="text-2xl font-bold mt-4">1/N 공동 경비 관리</Text>
        <Text className="text-slate-600 mt-1">영수증 OCR로 간편하게 정산</Text>
      </View>

      {/* Segmented tabs */}
      <View className="flex-row bg-white/80 rounded-xl overflow-hidden">
        <Pressable
          onPress={() => setTab("login")}
          className={`px-6 py-3 ${tab === "login" ? "bg-indigo-600" : ""}`}
        >
          <Text
            className={`font-semibold ${
              tab === "login" ? "text-white" : "text-slate-700"
            }`}
          >
            로그인
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("signup")}
          className={`px-6 py-3 ${tab === "signup" ? "bg-indigo-600" : ""}`}
        >
          <Text
            className={`font-semibold ${
              tab === "signup" ? "text-white" : "text-slate-700"
            }`}
          >
            회원가입
          </Text>
        </Pressable>
      </View>

      {tab === "login" ? (
        <View className="w-full max-w-md mt-6 gap-3">
          <Text className="text-slate-700">이메일</Text>
          <TextInput
            className="h-12 px-4 rounded-xl bg-white"
            value={loginEmail}
            onChangeText={setLoginEmail}
            keyboardType="email-address"
          />
          <Text className="text-slate-700 mt-2">비밀번호</Text>
          <TextInput
            className="h-12 px-4 rounded-xl bg-white"
            value={loginPassword}
            onChangeText={setLoginPassword}
            secureTextEntry
          />
          <Pressable
            onPress={submitLogin}
            className="h-12 mt-4 rounded-xl items-center justify-center bg-indigo-600"
          >
            <Text className="text-white font-semibold">로그인</Text>
          </Pressable>
        </View>
      ) : (
        <View className="w-full max-w-md mt-6 gap-3">
          <Text className="text-slate-700">이름</Text>
          <TextInput
            className="h-12 px-4 rounded-xl bg-white"
            value={signupName}
            onChangeText={setSignupName}
          />
          <Text className="text-slate-700 mt-2">이메일</Text>
          <TextInput
            className="h-12 px-4 rounded-xl bg-white"
            value={signupEmail}
            onChangeText={setSignupEmail}
            keyboardType="email-address"
          />
          <Text className="text-slate-700 mt-2">비밀번호</Text>
          <TextInput
            className="h-12 px-4 rounded-xl bg-white"
            value={signupPassword}
            onChangeText={setSignupPassword}
            secureTextEntry
          />
          <Pressable
            onPress={submitSignup}
            className="h-12 mt-4 rounded-xl items-center justify-center bg-indigo-600"
          >
            <Text className="text-white font-semibold">회원가입</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
