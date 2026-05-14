// Type mirrors of the FastAPI backend Pydantic schemas.
// Field names match the backend (snake_case).

export type ID = number;

export interface User {
  id: ID;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface Newcomer {
  id: ID;
  user_id: ID;
  mentor_id: ID | null;
  full_name?: string; // populated on dashboard endpoints, not on /newcomers/{id}
  email?: string;
  job_title: string;
  seniority: string;
  team: string;
  start_date: string | null;
  onboarding_status: string;
  main_goal?: string | null;
  known_skills?: string | null;
  known_gaps?: string | null;
  created_at: string;
}

export interface OnboardingTask {
  id: ID;
  plan_id: ID;
  title: string;
  description: string | null;
  week_number: number | null;
  day_number: number | null;
  task_type: string;
  status: "todo" | "in_progress" | "done" | "blocked" | string;
  priority: "low" | "medium" | "high" | string;
  success_criteria: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface OnboardingPlan {
  id: ID;
  newcomer_id?: ID;
  mentor_id?: ID | null;
  title: string;
  description: string | null;
  status: string;
  generated_by_ai: boolean;
  mentor_approved: boolean;
  ai_confidence?: number | null;
  missing_context?: string[] | null;
  created_at: string;
  updated_at?: string;
}

export interface OnboardingPlanWithTasks extends OnboardingPlan {
  tasks: OnboardingTask[];
}

export interface AIPlanGenerationResponse {
  plan_id: ID;
  title: string;
  status: string;
  generated_by_ai: boolean;
  mentor_approved: boolean;
  tasks_count: number;
  used_fallback: boolean;
}

export interface AISignal {
  id: ID;
  newcomer_id?: ID;
  signal_type: string;
  severity: "low" | "medium" | "high" | string;
  confidence?: number;
  score: number;
  title: string;
  description?: string;
  evidence?: string;
  suggested_action?: string;
  status: "open" | "resolved" | "ignored" | string;
  occurrence_count?: number;
  created_at: string;
  last_seen_at?: string | null;
  resolved_at?: string | null;
}

export interface AISignalDetectionResponse {
  newcomer_id: ID;
  created_count: number;
  updated_count: number;
  signals: AISignal[];
}

export interface AIQuestionSource {
  id?: ID;
  document_id?: ID;
  title?: string;
  excerpt?: string;
  source?: string;
  score?: number;
  url?: string | null;
}

export interface AIQuestion {
  id: ID;
  newcomer_id: ID | null;
  user_id: ID | null;
  question: string;
  answer: string;
  sources?: AIQuestionSource[];
  created_at: string;
}

export interface AIAskResponse {
  question_id: ID;
  question: string;
  answer: string;
  sources: AIQuestionSource[];
  people_to_ask?: { name: string; role?: string }[];
  follow_up_questions?: string[];
}

export interface DocumentItem {
  id: ID;
  title: string;
  content?: string;
  source: string;
  document_type: string;
  domain: string;
  role_target: string;
  scope: string;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeGroup {
  domain: string;
  count: number;
  documents: DocumentItem[];
}

export interface KnowledgeBaseResponse {
  total: number;
  groups: KnowledgeGroup[];
  missing_topics?: string[];
  detected_topics?: string[];
}

/* ---------- Mentor dashboard ---------- */
export interface MentorDashboardNewcomerItem {
  newcomer_id: ID;
  full_name: string;
  job_title: string;
  seniority: string;
  team: string;
  start_date: string | null;
  onboarding_status: string;
  active_plan_id: ID | null;
  total_tasks: number;
  completed_tasks: number;
  blocked_tasks: number;
  progress_percent: number;
  computed_status: string;
  latest_signal: AISignal | null;
}

export interface MentorDashboardResponse {
  active_newcomers: number;
  on_track_count: number;
  needs_attention_count: number;
  blocked_count: number;
  newcomers: MentorDashboardNewcomerItem[];
  // Some deployments include these; keep optional:
  recent_signals?: AISignal[];
  time_saved_hours?: number;
}

/* ---------- Newcomer dashboard ---------- */
export interface NewcomerDashboardProgress {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  blocked_tasks: number;
  todo_tasks: number;
  progress_percent: number;
  current_week: number;
  current_day: number;
}

export interface NewcomerDashboardResponse {
  newcomer: Newcomer & { full_name: string };
  active_plan: OnboardingPlan | null;
  progress: NewcomerDashboardProgress;
  today_tasks: OnboardingTask[];
  this_week_tasks: OnboardingTask[];
  blocked_tasks: OnboardingTask[];
  next_tasks: OnboardingTask[];
  recommended_documents?: DocumentItem[];
  people_to_know?: { name: string; role: string }[];
  suggested_questions?: string[];
  current_focus?: string | null;
  week_goal?: string | null;
}

/* ---------- Mentor → newcomer detail ---------- */
export interface MentorNewcomerDetail {
  newcomer: MentorDashboardNewcomerItem;
  signals: AISignal[];
  adjustments: { id: ID; title: string; status: string; created_at: string }[];
  skill_map?: { area: string; status: string }[];
  things_understood?: string[];
  events?: { id: ID; event_type: string; description?: string; created_at: string }[];
}

/* ---------- Task detail ---------- */
export interface TaskDetailResponse {
  task: OnboardingTask;
  why_it_matters?: string | null;
  related_documents?: DocumentItem[];
  related_ai_questions?: AIQuestion[];
  people_to_ask?: { name: string; role?: string }[];
  suggested_prompt?: string | null;
  blocked_report_status?: string | null;
}

export interface PlanAdjustment {
  id: ID;
  plan_id: ID;
  title?: string;
  strengths?: string[];
  gaps?: string[];
  changes?: { type: "add" | "remove" | "shift"; description: string }[];
  status: "draft" | "approved" | "declined" | "pending" | string;
  created_at: string;
}

export interface BlockedReport {
  id: ID;
  newcomer_id: ID;
  category: string;
  details?: string | null;
  ai_suggestion?: string | null;
  status: "open" | "resolved" | string;
  created_at: string;
}

export interface DemoSeedResponse {
  already_seeded: boolean;
  mentor_id?: ID;
  newcomer_id?: ID;
  newcomer_user_id?: ID;
  plan_id?: ID;
  signal_id?: ID;
  documents_created?: number;
  tasks_created?: number;
  questions_created?: number;
  [k: string]: unknown;
}

export interface PersonContact {
  id: ID;
  name: string;
  role?: string;
  team?: string;
  expertise?: string[];
}
