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

export interface TaskExample {
  title: string;
  content: string;
}

export interface TaskLink {
  label: string;
  url: string;
}

export interface OnboardingTask {
  id: ID;
  plan_id: ID;
  title: string;
  description: string | null;
  week_number: number | null;
  day_number: number | null;
  week_id?: ID | null;
  sprint_id?: ID | null;
  task_type: string;
  status: "todo" | "in_progress" | "done" | "blocked" | string;
  priority: "low" | "medium" | "high" | string;
  success_criteria: string | null;
  acceptance_criteria?: string | null;
  examples?: TaskExample[] | null;
  links?: TaskLink[] | null;
  manually_edited_fields?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface Week {
  id: ID;
  plan_id: ID;
  sprint_id: ID | null;
  index: number;
  title: string;
  summary: string | null;
  goals: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Sprint {
  id: ID;
  plan_id: ID;
  index: number;
  title: string;
  description: string | null;
  start_day: number | null;
  end_day: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type RegenScope = "plan" | "week" | "task";

export interface PlanRegenerateRequest {
  scope: RegenScope;
  target_id?: ID | null;
  preserve_manual_edits?: boolean;
  mentor_notes?: string | null;
  document_ids?: ID[];
}

export interface PlanRegenerateResponse {
  scope: RegenScope;
  plan_id: ID;
  target_id?: ID | null;
  summary: string;
  affected_task_ids: ID[];
  affected_week_ids?: ID[];
  used_fallback: boolean;
}

export type TaskAIField = "acceptance_criteria" | "description" | "examples" | "links";

export interface TaskAISuggestResponse {
  field: TaskAIField;
  suggestion: unknown;
}

export interface Lesson {
  id: ID;
  course_id: ID;
  index: number;
  title: string;
  body: string | null;
  summary: string | null;
  infographic_url?: string | null;
  infographic_kind?: string | null;
  infographic_source?: string | null;
  source_document_ids?: ID[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type CourseStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "published"
  | "rejected"
  | string;

export interface Course {
  id: ID;
  plan_id: ID | null;
  newcomer_id: ID | null;
  mentor_id: ID | null;
  role_target: string | null;
  title: string;
  summary: string | null;
  status: CourseStatus;
  generated_by_ai: boolean;
  source_document_ids?: ID[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
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
  source_type?: string | null;
  external_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduledMeeting {
  id: ID;
  title: string;
  agenda: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  teams_join_url: string | null;
  newcomer_id?: ID | null;
  organizer_user_id?: ID | null;
  plan_id?: ID | null;
  task_id?: ID | null;
  signal_id?: ID | null;
  attendee_emails?: string[] | null;
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
  people_to_ask?: { name?: string; full_name?: string; role?: string; team?: string }[];
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
  blocker_type: string;
  task_id?: ID | null;
  user_id?: ID | null;
  details?: string | null;
  ai_suggestion?: string | null;
  status: "open" | "resolved" | string;
  created_at: string;
  resolved_at?: string | null;
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
