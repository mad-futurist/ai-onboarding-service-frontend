import { apiBaseUrl } from "@/lib/api";
import type {
  ArenaHintEvent,
  ArenaStreamEvent,
  ID,
  PersonalBotStreamEvent,
} from "@/types";

export interface ArenaStreamHandle {
  close(): void;
}

function makeUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = apiBaseUrl.startsWith("http")
    ? apiBaseUrl
    : typeof window !== "undefined"
      ? `${window.location.origin}${apiBaseUrl}`
      : apiBaseUrl;
  const url = new URL(`${base}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function safeParse(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Open the per-turn arena chat stream. Emits user_saved → token* → analysis* → done.
 */
export function openArenaTurnStream(
  sessionId: ID,
  message: string,
  onEvent: (e: ArenaStreamEvent) => void,
): ArenaStreamHandle {
  const url = makeUrl(`/arena/sessions/${sessionId}/stream`, { message });
  const source = new EventSource(url);

  source.addEventListener("user_saved", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({ type: "user_saved", messageId: Number(data.messageId) });
  });

  source.addEventListener("token", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({ type: "token", delta: String(data.delta ?? "") });
  });

  source.addEventListener("analysis", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({
      type: "analysis",
      messageId: Number(data.messageId),
      dimension: (data.dimension as ArenaStreamEvent extends { dimension: infer D }
        ? D
        : never) ?? "discovery",
      delta: Number(data.delta ?? 0),
      label: String(data.label ?? ""),
      color: (data.color as "green" | "yellow" | "red" | "neutral") ?? "neutral",
      why: data.why ? String(data.why) : undefined,
    } as ArenaStreamEvent);
  });

  source.addEventListener("done", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({ type: "done", aiMessageId: data.aiMessageId == null ? null : Number(data.aiMessageId) });
    source.close();
  });

  source.addEventListener("error", (ev) => {
    const data = safeParse((ev as MessageEvent).data ?? "") ?? {};
    onEvent({ type: "error", message: String(data.message ?? "stream error") });
  });

  return {
    close() {
      source.close();
    },
  };
}

/**
 * Open the long-lived mentor-hint stream for a session. Keeps the connection alive
 * via SSE keepalive comments.
 */
export function openHintStream(
  sessionId: ID,
  onEvent: (e: ArenaHintEvent) => void,
): ArenaStreamHandle {
  const url = makeUrl(`/arena/sessions/${sessionId}/hints/stream`);
  const source = new EventSource(url);

  source.addEventListener("ready", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({ type: "ready", sessionId: Number(data.sessionId ?? sessionId) });
  });

  source.addEventListener("hint", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({
      type: "hint",
      text: String(data.text ?? ""),
      mentor_id: data.mentor_id == null ? null : Number(data.mentor_id),
      session_id: Number(data.session_id ?? sessionId),
    });
  });

  return {
    close() {
      source.close();
    },
  };
}

/**
 * Stream the Personal Bot building process: phases → final scenario.
 */
export function openPersonalBotStream(
  newcomerId: ID,
  options: { focus?: string[]; pain?: string },
  onEvent: (e: PersonalBotStreamEvent) => void,
): ArenaStreamHandle {
  const url = makeUrl("/arena/personal-bot/stream", {
    newcomer_id: newcomerId,
    focus: options.focus ? options.focus.join(",") : "",
    pain: options.pain ?? "",
  });
  const source = new EventSource(url);

  source.addEventListener("phase", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({
      type: "phase",
      phase: String(data.phase ?? ""),
      label: String(data.label ?? ""),
    });
  });

  source.addEventListener("done", (ev) => {
    const data = safeParse((ev as MessageEvent).data) ?? {};
    onEvent({
      type: "done",
      scenarioId: Number(data.scenarioId),
      title: String(data.title ?? ""),
      description: (data.description as string | null) ?? null,
      cover_emoji: (data.cover_emoji as string | null) ?? null,
      difficulty: Number(data.difficulty ?? 3),
      persona: (data.persona ?? {}) as PersonalBotStreamEvent extends { persona: infer P }
        ? P
        : never,
    } as PersonalBotStreamEvent);
    source.close();
  });

  source.addEventListener("error", (ev) => {
    const data = safeParse((ev as MessageEvent).data ?? "") ?? {};
    onEvent({ type: "error", message: String(data.message ?? "stream error") });
  });

  return {
    close() {
      source.close();
    },
  };
}
