"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";

import { seedDemo } from "@/services/demo";
import { listUsers } from "@/services/users";
import { listNewcomers } from "@/services/newcomers";
import type { Role } from "@/lib/constants";
import type { DemoPersona, ID, Newcomer, User } from "@/types";

const SEED_KEY = "onbord.seeded.v1";
const ROLE_KEY = "onbord.role.v1";
const MENTOR_KEY = "onbord.mentor_id.v1";
const NEWCOMER_KEY = "onbord.newcomer_id.v1";
const GUIDED_DEMO_KEY = "onbord.guidedDemo.active.v1";
const GUIDED_DEMO_STEP_KEY = "onbord.guidedDemo.step.v1";

interface DemoContextValue {
  ready: boolean;
  seeding: boolean;
  error: string | null;
  role: Role;
  mentorId: ID | null;
  newcomerId: ID | null;
  mentorName: string;
  newcomerName: string;
  personas: DemoPersona[];
  activePersona: DemoPersona | null;
  guidedDemoActive: boolean;
  guidedDemoStep: number;
  setRole: (role: Role) => void;
  startGuidedDemo: () => void;
  stopGuidedDemo: () => void;
  setGuidedDemoStep: (step: number) => void;
  selectPersona: (
    persona: DemoPersona,
    options?: { preserveRole?: boolean },
  ) => void;
  refresh: () => Promise<void>;
  refreshPersonas: () => Promise<void>;
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

function parseStoredId(key: string): ID | null {
  const raw = getStored<string>(key);
  const parsed = raw ? Number(raw) : null;
  return parsed && Number.isFinite(parsed) ? parsed : null;
}

function buildPersonas(users: User[], newcomers: Newcomer[]): DemoPersona[] {
  const mentorPersonas = users
    .filter((user) => user.role?.toLowerCase().includes("mentor"))
    .sort((a, b) => a.id - b.id)
    .map<DemoPersona>((user) => ({
      role: "mentor",
      user_id: user.id,
      newcomer_id: null,
      name: user.full_name,
      email: user.email,
      job_title: user.role,
      team: "Mentor",
    }));

  const newcomerPersonas = [...newcomers]
    .sort((a, b) => a.id - b.id)
    .map<DemoPersona>((newcomer) => {
      const user = users.find((item) => item.id === newcomer.user_id);
      return {
        role: "newcomer",
        user_id: newcomer.user_id,
        newcomer_id: newcomer.id,
        name: newcomer.full_name ?? user?.full_name ?? `Newcomer #${newcomer.id}`,
        email: newcomer.email ?? user?.email ?? "",
        job_title: newcomer.job_title,
        team: newcomer.team,
      };
    });

  return [...mentorPersonas, ...newcomerPersonas];
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [role, setRoleState] = React.useState<Role>("mentor");
  const [mentorId, setMentorId] = React.useState<ID | null>(null);
  const [newcomerId, setNewcomerId] = React.useState<ID | null>(null);
  const [mentorName, setMentorName] = React.useState<string>("Oleg Bondarenko");
  const [newcomerName, setNewcomerName] = React.useState<string>("Marina Kovalenko");
  const [personas, setPersonas] = React.useState<DemoPersona[]>([]);
  const [guidedDemoActive, setGuidedDemoActive] = React.useState(false);
  const [guidedDemoStepState, setGuidedDemoStepState] = React.useState(0);

  const seedMut = useMutation({
    mutationFn: seedDemo,
  });

  React.useEffect(() => {
    queueMicrotask(() => {
      const storedRole = getStored<string>(ROLE_KEY);
      if (storedRole === "mentor" || storedRole === "newcomer") {
        setRoleState(storedRole);
      }

      const storedMentorId = parseStoredId(MENTOR_KEY);
      if (storedMentorId) setMentorId(storedMentorId);

      const storedNewcomerId = parseStoredId(NEWCOMER_KEY);
      if (storedNewcomerId) setNewcomerId(storedNewcomerId);

      const guidedActive = window.sessionStorage.getItem(GUIDED_DEMO_KEY) === "1";
      const guidedStep = Number(window.sessionStorage.getItem(GUIDED_DEMO_STEP_KEY) ?? "0");
      setGuidedDemoActive(guidedActive);
      setGuidedDemoStepState(Number.isFinite(guidedStep) ? guidedStep : 0);
    });
  }, []);

  const selectPersona = React.useCallback(
    (persona: DemoPersona, options?: { preserveRole?: boolean }) => {
      if (persona.role === "mentor") {
        setMentorId(persona.user_id);
        setMentorName(persona.name);
        setStored(MENTOR_KEY, String(persona.user_id));
        if (!options?.preserveRole) {
          setRoleState("mentor");
          setStored(ROLE_KEY, "mentor");
        }
      } else if (persona.newcomer_id) {
        setNewcomerId(persona.newcomer_id);
        setNewcomerName(persona.name);
        setStored(NEWCOMER_KEY, String(persona.newcomer_id));
        if (!options?.preserveRole) {
          setRoleState("newcomer");
          setStored(ROLE_KEY, "newcomer");
        }
      }
    },
    [],
  );

  const hydrateFromBackend = React.useCallback(async () => {
    try {
      const [users, newcomers] = await Promise.all([listUsers(), listNewcomers()]);
      const nextPersonas = buildPersonas(users, newcomers);
      setPersonas(nextPersonas);

      const mentorPersonas = nextPersonas.filter((item) => item.role === "mentor");
      const newcomerPersonas = nextPersonas.filter(
        (item) => item.role === "newcomer" && item.newcomer_id,
      );

      const storedMentorId = parseStoredId(MENTOR_KEY);
      const nextMentor =
        mentorPersonas.find((item) => item.user_id === storedMentorId) ??
        mentorPersonas[0];
      if (nextMentor) {
        setMentorId(nextMentor.user_id);
        setMentorName(nextMentor.name);
        setStored(MENTOR_KEY, String(nextMentor.user_id));
      } else {
        setMentorId(null);
        setStored(MENTOR_KEY, null);
      }

      const storedNewcomerId = parseStoredId(NEWCOMER_KEY);
      const nextNewcomer =
        newcomerPersonas.find((item) => item.newcomer_id === storedNewcomerId) ??
        newcomerPersonas[0];
      if (nextNewcomer?.newcomer_id) {
        setNewcomerId(nextNewcomer.newcomer_id);
        setNewcomerName(nextNewcomer.name);
        setStored(NEWCOMER_KEY, String(nextNewcomer.newcomer_id));
      } else {
        setNewcomerId(null);
        setStored(NEWCOMER_KEY, null);
      }
    } catch (e) {
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
    queueMicrotask(() => void bootstrap());
  }, [bootstrap]);

  const setRole = React.useCallback((r: Role) => {
    setRoleState(r);
    setStored(ROLE_KEY, r);
  }, []);

  const setGuidedDemoStep = React.useCallback((step: number) => {
    const next = Math.max(0, step);
    setGuidedDemoStepState(next);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(GUIDED_DEMO_STEP_KEY, String(next));
    }
  }, []);

  const startGuidedDemo = React.useCallback(() => {
    setGuidedDemoActive(true);
    setGuidedDemoStep(0);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(GUIDED_DEMO_KEY, "1");
    }
  }, [setGuidedDemoStep]);

  const stopGuidedDemo = React.useCallback(() => {
    setGuidedDemoActive(false);
    setGuidedDemoStepState(0);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(GUIDED_DEMO_KEY);
      window.sessionStorage.removeItem(GUIDED_DEMO_STEP_KEY);
    }
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("demo-active", guidedDemoActive);
    return () => {
      document.body.classList.remove("demo-active");
    };
  }, [guidedDemoActive]);

  const refreshPersonas = React.useCallback(async () => {
    await hydrateFromBackend();
  }, [hydrateFromBackend]);

  const refresh = React.useCallback(async () => {
    sessionStorage.removeItem(SEED_KEY);
    setReady(false);
    await bootstrap();
  }, [bootstrap]);

  const activePersona = React.useMemo(() => {
    if (role === "mentor") {
      return personas.find((item) => item.role === "mentor" && item.user_id === mentorId) ?? null;
    }
    return (
      personas.find(
        (item) => item.role === "newcomer" && item.newcomer_id === newcomerId,
      ) ?? null
    );
  }, [mentorId, newcomerId, personas, role]);

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
      personas,
      activePersona,
      guidedDemoActive,
      guidedDemoStep: guidedDemoStepState,
      setRole,
      startGuidedDemo,
      stopGuidedDemo,
      setGuidedDemoStep,
      selectPersona,
      refresh,
      refreshPersonas,
    }),
    [
      ready,
      seedMut.isPending,
      error,
      role,
      mentorId,
      newcomerId,
      mentorName,
      newcomerName,
      personas,
      activePersona,
      guidedDemoActive,
      guidedDemoStepState,
      setRole,
      startGuidedDemo,
      stopGuidedDemo,
      setGuidedDemoStep,
      selectPersona,
      refresh,
      refreshPersonas,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
