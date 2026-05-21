import { api } from "@/lib/api";
import type {
  ArenaDashboard,
  ArenaDebrief,
  ArenaKbOption,
  ArenaKbSnippet,
  ArenaLeaderboardEntry,
  ArenaMessage,
  ArenaMessageCoach,
  ArenaScenario,
  ArenaScenarioCreateInput,
  ArenaSession,
  ID,
  NewcomerArenaSummary,
  PersonalBotRequestInput,
  PersonalBotSpec,
  PersonalBotSuggestions,
} from "@/types";

export async function listArenaScenarios(params?: {
  newcomer_id?: ID;
  mentor_id?: ID;
}): Promise<ArenaScenario[]> {
  const { data } = await api.get<ArenaScenario[]>("/arena/scenarios", { params });
  return data;
}

export async function getArenaScenario(scenarioId: ID): Promise<ArenaScenario> {
  const { data } = await api.get<ArenaScenario>(`/arena/scenarios/${scenarioId}`);
  return data;
}

export async function createArenaScenario(
  input: ArenaScenarioCreateInput,
): Promise<ArenaScenario> {
  const { data } = await api.post<ArenaScenario>("/arena/scenarios", input);
  return data;
}

export async function startArenaSession(
  scenarioId: ID,
  newcomerId: ID,
): Promise<ArenaSession> {
  const { data } = await api.post<ArenaSession>("/arena/sessions", {
    scenario_id: scenarioId,
    newcomer_id: newcomerId,
  });
  return data;
}

export async function listArenaSessions(params?: {
  newcomer_id?: ID;
  mentor_id?: ID;
  limit?: number;
}): Promise<ArenaSession[]> {
  const { data } = await api.get<ArenaSession[]>("/arena/sessions", { params });
  return data;
}

export async function getArenaSession(sessionId: ID): Promise<ArenaSession> {
  const { data } = await api.get<ArenaSession>(`/arena/sessions/${sessionId}`);
  return data;
}

export async function listSessionMessages(sessionId: ID): Promise<ArenaMessage[]> {
  const { data } = await api.get<ArenaMessage[]>(
    `/arena/sessions/${sessionId}/messages`,
  );
  return data;
}

export async function endArenaSession(sessionId: ID): Promise<ArenaDebrief> {
  const { data } = await api.post<ArenaDebrief>(`/arena/sessions/${sessionId}/end`);
  return data;
}

export async function getArenaDebrief(sessionId: ID): Promise<ArenaDebrief> {
  const { data } = await api.get<ArenaDebrief>(`/arena/sessions/${sessionId}/debrief`);
  return data;
}

export async function sendMentorHint(
  sessionId: ID,
  text: string,
  mentorId?: ID | null,
): Promise<{ delivered_to: number; text: string }> {
  const { data } = await api.post(`/arena/sessions/${sessionId}/hint`, {
    text,
    mentor_id: mentorId ?? null,
  });
  return data;
}

export async function getMentorArenaDashboard(mentorId: ID): Promise<ArenaDashboard> {
  const { data } = await api.get<ArenaDashboard>("/arena/dashboard", {
    params: { mentor_id: mentorId },
  });
  return data;
}

export async function getNewcomerArenaSummary(
  newcomerId: ID,
): Promise<NewcomerArenaSummary> {
  const { data } = await api.get<NewcomerArenaSummary>(
    `/arena/newcomers/${newcomerId}/summary`,
  );
  return data;
}

export async function getArenaLeaderboard(params?: {
  team?: string;
  limit?: number;
}): Promise<ArenaLeaderboardEntry[]> {
  const { data } = await api.get<ArenaLeaderboardEntry[]>("/arena/leaderboard", {
    params,
  });
  return data;
}

export async function createPersonalBot(
  input: PersonalBotRequestInput,
): Promise<ArenaScenario> {
  const { data } = await api.post<ArenaScenario>("/arena/personal-bot", input);
  return data;
}

export async function coachArenaMessage(messageId: ID): Promise<ArenaMessageCoach> {
  const { data } = await api.post<ArenaMessageCoach>(
    `/arena/messages/${messageId}/coach`,
  );
  return data;
}

export async function listSessionKbSnippets(
  sessionId: ID,
): Promise<ArenaKbSnippet[]> {
  const { data } = await api.get<ArenaKbSnippet[]>(
    `/arena/sessions/${sessionId}/kb-snippets`,
  );
  return data;
}

export async function listKbOptions(params?: {
  domain?: string;
}): Promise<ArenaKbOption[]> {
  const { data } = await api.get<ArenaKbOption[]>("/arena/kb-options", { params });
  return data;
}

export async function getPersonalBotSuggestions(
  newcomerId: ID,
): Promise<PersonalBotSuggestions> {
  const { data } = await api.get<PersonalBotSuggestions>(
    "/arena/personal-bot/suggestions",
    { params: { newcomer_id: newcomerId } },
  );
  return data;
}

export async function previewPersonalBot(input: {
  newcomer_id: ID;
  focus_dimensions: string[];
  pain_text: string;
  source_ids: ID[];
}): Promise<PersonalBotSpec> {
  const { data } = await api.post<PersonalBotSpec>(
    "/arena/personal-bot/preview",
    input,
  );
  return data;
}

export async function createPersonalBotFromSpec(input: {
  newcomer_id: ID;
  spec: PersonalBotSpec;
  source_ids: ID[];
}): Promise<ArenaScenario> {
  const { data } = await api.post<ArenaScenario>(
    "/arena/personal-bot/from-spec",
    input,
  );
  return data;
}
