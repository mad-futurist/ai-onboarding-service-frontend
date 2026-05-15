import { api } from "@/lib/api";
import type { ID, LessonNote } from "@/types";

export async function getLessonNote(
  newcomerId: ID,
  lessonId: ID,
): Promise<LessonNote | null> {
  const { data } = await api.get<LessonNote | null>(
    `/lesson-notes/newcomers/${newcomerId}/lessons/${lessonId}`,
  );
  return data;
}

export async function upsertLessonNote(
  newcomerId: ID,
  lessonId: ID,
  body: string,
): Promise<LessonNote> {
  const { data } = await api.put<LessonNote>(
    `/lesson-notes/newcomers/${newcomerId}/lessons/${lessonId}`,
    { body },
  );
  return data;
}

export async function deleteLessonNote(
  newcomerId: ID,
  lessonId: ID,
): Promise<void> {
  await api.delete(`/lesson-notes/newcomers/${newcomerId}/lessons/${lessonId}`);
}
