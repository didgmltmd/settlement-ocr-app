import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowRight,
  CreditCard,
  Receipt,
  Shield,
  UserPlus,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAppState } from "../lib/app-state";

type FocusKey =
  | "login-email"
  | "login-password"
  | "signup-name"
  | "signup-email"
  | "signup-password"
  | null;

export default function Auth() {
  const { setCurrentUser, setAuth } = useAppState();
  const [isSignup, setIsSignup] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusKey>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const API_BASE =
    "https://settlment-app-production.up.railway.app/api/v1/auth";

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(floatA, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatA, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(floatB, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatB, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [floatA, floatB]);

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Toast.show({ type: "error", text1: "모든 필드를 입력해주세요" });
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginEmail, password: loginPassword }),
      });
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "로그인에 실패했습니다");
      }
      const data = await resp.json();
      Toast.show({ type: "success", text1: "로그인 성공!" });
      setAuth({ accessToken: data.accessToken ?? null });
      setCurrentUser({
        id: String(data.userId ?? ""),
        name: data.nickname || data.username || loginEmail,
      });
      router.replace("/groups");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "로그인 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) {
      Toast.show({ type: "error", text1: "모든 필드를 입력해주세요" });
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupEmail,
          password: signupPassword,
          nickname: signupName,
        }),
      });
      if (!resp.ok) {
        const message = await resp.text();
        throw new Error(message || "회원가입에 실패했습니다");
      }
      Toast.show({ type: "success", text1: "회원가입 되었습니다!" });
      Alert.alert("회원가입 완료", "로그인 하러 갈까요?", [
        { text: "취소", style: "cancel" },
        {
          text: "로그인으로 이동",
          onPress: () => {
            setIsSignup(false);
            setLoginEmail(signupEmail);
          },
        },
      ]);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "회원가입 실패",
        text2: err instanceof Error ? err.message : "다시 시도해주세요",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <View style={styles.cardContent}>
      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={[
          styles.input,
          focusedField === "login-email" && styles.inputFocused,
        ]}
        placeholder="your@email.com"
        value={loginEmail}
        onChangeText={setLoginEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={() => setFocusedField("login-email")}
        onBlur={() => setFocusedField(null)}
        placeholderTextColor="#94a3b8"
      />
      <Text style={[styles.label, styles.labelSpacing]}>비밀번호</Text>
      <TextInput
        style={[
          styles.input,
          focusedField === "login-password" && styles.inputFocused,
        ]}
        placeholder="••••••••"
        value={loginPassword}
        onChangeText={setLoginPassword}
        secureTextEntry
        onFocus={() => setFocusedField("login-password")}
        onBlur={() => setFocusedField(null)}
        placeholderTextColor="#94a3b8"
      />
      <Pressable
        disabled={isLoading}
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.primaryWrapper,
          pressed && styles.primaryWrapperPressed,
        ]}
      >
        <LinearGradient
          colors={["#6366f1", "#a855f7"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "로그인 중..." : "로그인"}
          </Text>
          <ArrowRight size={18} color="white" />
        </LinearGradient>
      </Pressable>
      <Pressable
        onPress={() => setIsSignup(true)}
        style={({ pressed }) => [
          styles.linkButton,
          pressed && styles.linkButtonPressed,
        ]}
      >
        <Text style={styles.linkText}>회원가입하기</Text>
        <ArrowRight size={14} color="#4f46e5" />
      </Pressable>
    </View>
  );

  const renderSignupForm = () => (
    <View style={styles.cardContent}>
      <Text style={styles.label}>이름</Text>
      <TextInput
        style={[
          styles.input,
          focusedField === "signup-name" && styles.inputFocused,
        ]}
        placeholder="홍길동"
        value={signupName}
        onChangeText={setSignupName}
        onFocus={() => setFocusedField("signup-name")}
        onBlur={() => setFocusedField(null)}
        placeholderTextColor="#94a3b8"
      />
      <Text style={[styles.label, styles.labelSpacing]}>이메일</Text>
      <TextInput
        style={[
          styles.input,
          focusedField === "signup-email" && styles.inputFocused,
        ]}
        placeholder="your@email.com"
        value={signupEmail}
        onChangeText={setSignupEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={() => setFocusedField("signup-email")}
        onBlur={() => setFocusedField(null)}
        placeholderTextColor="#94a3b8"
      />
      <Text style={[styles.label, styles.labelSpacing]}>비밀번호</Text>
      <TextInput
        style={[
          styles.input,
          focusedField === "signup-password" && styles.inputFocused,
        ]}
        placeholder="••••••••"
        value={signupPassword}
        onChangeText={setSignupPassword}
        secureTextEntry
        onFocus={() => setFocusedField("signup-password")}
        onBlur={() => setFocusedField(null)}
        placeholderTextColor="#94a3b8"
      />
      <Pressable
        disabled={isLoading}
        onPress={handleSignup}
        style={({ pressed }) => [
          styles.primaryWrapper,
          pressed && styles.primaryWrapperPressed,
        ]}
      >
        <LinearGradient
          colors={["#a855f7", "#ec4899"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "가입 중..." : "회원가입"}
          </Text>
          <ArrowRight size={18} color="white" />
        </LinearGradient>
      </Pressable>
      <Pressable
        onPress={() => setIsSignup(false)}
        style={({ pressed }) => [
          styles.linkButton,
          pressed && styles.linkButtonPressed,
          { alignSelf: "flex-end" },
        ]}
      >
        <Text style={styles.linkText}>로그인하러 가기</Text>
        <ArrowRight size={14} color="#4f46e5" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.blob,
            styles.blobIndigo,
            {
              transform: [
                {
                  translateY: floatA.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -16],
                  }),
                },
                {
                  translateX: floatA.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  }),
                },
              ],
              opacity: floatA.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.45],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.blob,
            styles.blobPurple,
            {
              transform: [
                {
                  translateY: floatB.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, -14],
                  }),
                },
                {
                  translateX: floatB.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 6],
                  }),
                },
              ],
              opacity: floatB.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4],
              }),
            },
          ]}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Receipt size={32} color="white" />
            </View>
            <Text style={styles.heroTitle}>1/N 공동 경비 관리</Text>
            <Text style={styles.heroSubtitle}>
              영수증 OCR로 간편하게 정산하세요
            </Text>
            <View style={styles.heroStats}>
              <StatPill icon={Shield} label="안전한 관리" />
              <StatPill icon={CreditCard} label="자동 영수증" />
              <StatPill icon={UserPlus} label="그룹 초대" />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.formHeader}>
              {isSignup ? (
                <>
                  <UserPlus size={18} color="#a855f7" />
                  <Text style={styles.formHeaderText}>새 계정 만들기</Text>
                </>
              ) : (
                <>
                  <Shield size={18} color="#4f46e5" />
                  <Text style={styles.formHeaderText}>계정에 로그인</Text>
                </>
              )}
            </View>
            {isSignup ? renderSignupForm() : renderLoginForm()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type StatPillProps = { icon: typeof Receipt; label: string };

function StatPill({ icon: Icon, label }: StatPillProps) {
  return (
    <View style={styles.statPill}>
      <Icon size={16} color="#312e81" />
      <Text style={styles.statPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    justifyContent: "center",
  },
  blob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -80,
    left: -40,
  },
  blobIndigo: {
    backgroundColor: "#c7d2fe",
  },
  blobPurple: {
    backgroundColor: "#f3e8ff",
    top: undefined,
    bottom: -60,
    right: -60,
    left: undefined,
  },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  heroIconWrap: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 18,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  heroSubtitle: {
    color: "#475569",
    fontSize: 14,
  },
  heroStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
  },
  statPillText: {
    color: "#312e81",
    fontWeight: "600",
    fontSize: 12,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#1f2937",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 14,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  formHeaderText: {
    fontWeight: "700",
    color: "#0f172a",
  },
  cardContent: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  labelSpacing: {
    marginTop: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    color: "#0f172a",
  },
  inputFocused: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryWrapper: {
    marginTop: 12,
    borderRadius: 16,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryWrapperPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  linkButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  linkButtonPressed: {
    opacity: 0.75,
    transform: [{ translateY: 1 }],
  },
  linkText: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 13,
  },
});
