import { api } from "@/lib/api";
import type { Course, CourseWithLessons, Lesson, ID } from "@/types";

export interface CourseListFilters {
  mentor_id?: ID;
  newcomer_id?: ID;
  plan_id?: ID;
  role_target?: string;
  status?: string;
  include_role_matches?: boolean;
  public_only?: boolean;
}

export async function listCourses(filters?: CourseListFilters): Promise<Course[]> {
  const { data } = await api.get<Course[]>("/courses", { params: filters });
  return data;
}

export async function getCourse(
  id: ID,
  params?: { newcomer_id?: ID },
): Promise<CourseWithLessons> {
  const { data } = await api.get<CourseWithLessons>(`/courses/${id}`, { params });
  return data;
}

export interface CourseCreateInput {
  title: string;
  summary?: string | null;
  plan_id?: ID | null;
  newcomer_id?: ID | null;
  mentor_id?: ID | null;
  role_target?: string | null;
  source_document_ids?: ID[] | null;
}

export async function createCourse(payload: CourseCreateInput): Promise<Course> {
  const { data } = await api.post<Course>("/courses", payload);
  return data;
}

export interface CourseAIGenerateInput {
  title?: string | null;
  prompt_hint: string;
  mentor_id?: ID | null;
  newcomer_id?: ID | null;
  plan_id?: ID | null;
  role_target?: string | null;
  document_ids?: ID[];
  lesson_count?: number;
}

export async function aiGenerateCourse(payload: CourseAIGenerateInput): Promise<CourseWithLessons> {
  const { data } = await api.post<CourseWithLessons>("/courses/ai-generate", payload);
  return data;
}

export interface CourseUpdateInput {
  title?: string;
  summary?: string | null;
  plan_id?: ID | null;
  newcomer_id?: ID | null;
  mentor_id?: ID | null;
  role_target?: string | null;
  source_document_ids?: ID[] | null;
}

export async function updateCourse(id: ID, payload: CourseUpdateInput): Promise<Course> {
  const { data } = await api.patch<Course>(`/courses/${id}`, payload);
  return data;
}

export async function deleteCourse(id: ID): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export async function submitCourseForApproval(id: ID): Promise<Course> {
  const { data } = await api.post<Course>(`/courses/${id}/submit-for-approval`);
  return data;
}

export async function approveCourse(id: ID): Promise<Course> {
  const { data } = await api.post<Course>(`/courses/${id}/approve`);
  return data;
}

export async function publishCourse(id: ID): Promise<Course> {
  const { data } = await api.post<Course>(`/courses/${id}/publish`);
  return data;
}

export async function rejectCourse(id: ID): Promise<Course> {
  const { data } = await api.post<Course>(`/courses/${id}/reject`);
  return data;
}

export interface LessonCreateInput {
  index?: number;
  title: string;
  body?: string | null;
  summary?: string | null;
  infographic_url?: string | null;
  infographic_kind?: string | null;
  infographic_source?: string | null;
  video_url?: string | null;
  source_document_ids?: ID[] | null;
}

export async function createLesson(courseId: ID, payload: LessonCreateInput): Promise<Lesson> {
  const { data } = await api.post<Lesson>(`/courses/${courseId}/lessons`, payload);
  return data;
}

export interface LessonUpdateInput {
  index?: number;
  title?: string;
  body?: string | null;
  summary?: string | null;
  infographic_url?: string | null;
  infographic_kind?: string | null;
  infographic_source?: string | null;
  video_url?: string | null;
  source_document_ids?: ID[] | null;
}

export async function updateLesson(lessonId: ID, payload: LessonUpdateInput): Promise<Lesson> {
  const { data } = await api.patch<Lesson>(`/courses/lessons/${lessonId}`, payload);
  return data;
}

export async function deleteLesson(lessonId: ID): Promise<void> {
  await api.delete(`/courses/lessons/${lessonId}`);
}

export async function aiGenerateLesson(
  courseId: ID,
  lessonTitle: string,
  lessonSummary: string,
): Promise<Lesson> {
  const { data } = await api.post<Lesson>(`/courses/${courseId}/lessons/ai-generate`, null, {
    params: { lesson_title: lessonTitle, lesson_summary: lessonSummary },
  });
  return data;
}
