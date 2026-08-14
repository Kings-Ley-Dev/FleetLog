"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserDTO } from "@/types";

const UserContext = createContext<UserDTO | null>(null);

export function UserProvider({ user, children }: { user: UserDTO; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

/** Current signed-in user, available to any Client Component under the
 * dashboard shell without an extra /api/auth/me round trip. */
export function useUser(): UserDTO {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within the dashboard layout.");
  return ctx;
}
