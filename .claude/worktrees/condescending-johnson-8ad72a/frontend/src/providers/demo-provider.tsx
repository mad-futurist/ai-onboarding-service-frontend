"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";

import { seedDemo } from "@/services/demo";
import { listUsers } from "@/services/users";
import { listNewcomers } from "@/services/newcomers";
import type { Role } from "@/lib/constants";
import type { ID } from "@/types";

const SEED_KEY = "onbord.seeded.v1";
const ROLE_KEY = "onbord.role.v1";
const MENTOR_KEY = "onbord.mentor_id.v1";
const NEWCOMER_KEY = "onbord.newcomer_id.v1";

interface DemoContextValue {
  ready: boolean;
  seeding: boolean;
  error: string | null;
  role: Role;
  mentorId: ID | null;
  newcomerId: ID | null;
  mentorName: string;
  newcomerName: string;
  setRole: (role: Role) => void;
  refresh: () => Promise<void>;
}

const DemoContext = React.createContext<DemoContextValue | null>(null);

export function useDemo(): DemoContextValue {
  const ctx = React.useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within <DemoProvider>");
  return ctx;
}

function getStored<T = string>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(key);
  return v === null ? null : (v as unknown as T);
}

function setStored(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, value);
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [role, setRoleState] = React.useState<Role>(() => {
    const v = getStored<string>(ROLE_KEY);
    return v === "newcomer" ? "newcomer" : "mentor";
  });
  const [mentorId, setMentorId] = React.useState<ID | null>(() => {
    const v = getStored<string>(MENTOR_KEY);
    return v ? Number(v) : null;
  });
  const [newcomerId, setNewcomerId] = React.useState<ID | null>(() => {
    const v = getStored<string>(NEWCOMER_KEY);
    return v ? Number(v) : null;
  });
  const [mentorName, setMentorName] = React.useState<string>("Marko Ivanov");
  const [newcomerName, setNewcomerName] = React.useState<string>("Tanya Petrova");

  const seedMut = useMutation({
    mutationFn: seedDemo,
  });

  const hydrateFromBackend = React.useCallback(async () => {
    // Pull user/newcomer info to confirm IDs exist and capture names
    try {
      const [users, newcomers] = await Promise.all([listUsers(), listNewcomers()]);
      const mentor = users.find((u) => u.role?.toLowerCase().includes("mentor")) ?? users[0];
      const newcomer = newcomers[0];
      if (mentor) {
        setMentorId(mentor.id);
        setMentorName(mentor.full_name);
        setStored(MENTOR_KEY, String(mentor.id));
      }
      if (newcomer) {
        setNewcomerId(newcomer.id);
        if (newcomer.full_name) {
          setNewcomerName(newcomer.full_name);
        } else {
          // newcomer.user_id → look up
          const u = users.find((x) => x.id === newcomer.user_id);
          if (u?.full_name) setNewcomerName(u.full_name);
        }
        setStored(NEWCOMER_KEY, String(newcomer.id));
      }
    } catch (e) {
      // If listing fails, we still try the seed result
      console.warn("[demo] hydrate failed", e);
    }
  }, []);

  const bootstrap = React.useCallback(async () => {
    setError(null);
    try {
      const alreadyBootstrapped = sessionStorage.getItem(SEED_KEY) === "1";
      if (!alreadyBootstrapped) {
        const seed = await seedMut.mutateAsync();
        sessionStorage.setItem(SEED_KEY, "1");
        if (seed.mentor_id) {
          setMentorId(seed.mentor_id);
          setStored(MENTOR_KEY, String(seed.mentor_id));
        }
        if (seed.newcomer_id) {
          setNewcomerId(seed.newcomer_id);
          setStored(NEWCOMER_KEY, String(seed.newcomer_id));
        }
      }
      await hydrateFromBackend();
      setReady(true);
    } catch (e) {
      console.error("[demo] bootstrap failed", e);
      setError(e instanceof Error ? e.message : "Failed to reach backend");
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrateFromBackend]);

  React.useEffect(() => {
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRole = React.useCallback((r: Role) => {
    setRoleState(r);
    setStored(ROLE_KEY, r);
  }, []);

  const refresh = React.useCallback(async () => {
    sessionStorage.removeItem(SEED_KEY);
    setReady(false);
    await bootstrap();
  }, [bootstrap]);

  const value = React.useMemo<DemoContextValue>(
    () => ({
      ready,
      seeding: seedMut.isPending,
      error,
      role,
      mentorId,
      newcomerId,
      mentorName,
      newcomerName,
      setRole,
      refresh,
    }),
    [ready, seedMut.isPending, error, role, mentorId, newcomerId, mentorName, newcomerName, setRole, refresh],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
