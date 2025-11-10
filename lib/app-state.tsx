// lib/app-state.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

export type User = { id: string; name: string } | null;
export type Group = { id: string; name: string; members: string[] } | null;

type AppState = {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  currentGroup: Group;
  setCurrentGroup: (g: Group) => void;
  logout: () => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [currentGroup, setCurrentGroup] = useState<Group>(null);

  const logout = () => {
    setCurrentUser(null);
    setCurrentGroup(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      currentGroup,
      setCurrentGroup,
      logout,
    }),
    [currentUser, currentGroup]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
