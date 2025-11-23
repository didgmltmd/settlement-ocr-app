// lib/app-state.tsx
import { router } from "expo-router";
import React, { createContext, useContext, useMemo, useState } from "react";

export type User = { id: string; name: string } | null;
export type AuthState = { accessToken: string | null };
export type Group = { id: string; name: string; members: string[] } | null;

type AppState = {
  currentUser: User;
  auth: AuthState;
  setCurrentUser: (u: User) => void;
  setAuth: (auth: AuthState) => void;
  currentGroup: Group;
  setCurrentGroup: (g: Group) => void;
  logout: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [auth, setAuth] = useState<AuthState>({ accessToken: null });
  const [currentGroup, setCurrentGroup] = useState<Group>(null);

  const logout = () => {
    setCurrentUser(null);
    setAuth({ accessToken: null });
    setCurrentGroup(null);
    setTimeout(() => router.replace("/auth"), 0);
  };

  const value = useMemo(
    () => ({
      currentUser,
      auth,
      setCurrentUser,
      setAuth,
      currentGroup,
      setCurrentGroup,
      logout,
    }),
    [currentUser, auth, currentGroup]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
