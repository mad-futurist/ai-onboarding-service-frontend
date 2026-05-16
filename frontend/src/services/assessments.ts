import { api } from "@/lib/api";
import type {
  Assessment,
  AssessmentGenerateInput,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentDifficulty,
  AssessmentOption,
  AssessmentRegenerateInput,
  AssessmentSubmission,
  AssessmentSubmissionInput,
  ID,
} from "@/types";

export interface QuestionPayload {
  question_type: AssessmentQuestionType;
  prompt: string;
  context?: string | null;
  options?: AssessmentOption[] | null;
  expected_answer?: string | null;
  skill_tag?: string | null;
  difficulty?: AssessmentDifficulty | null;
  order_index?: number;
}

export async function generateAssessment(
  input: AssessmentGenerateInput,
): Promise<Assessment> {
  const { data } = await api.post<Assessment>("/assessments/generate", input);
  return data;
}

export async function regenerateAssessment(
  assessmentId: ID,
  input: AssessmentRegenerateInput,
): Promise<Assessment> {
  const { data } = await api.post<Assessment>(
    `/assessments/${assessmentId}/regenerate`,
    input,
  );
  return data;
}

export async function getAssessment(id: ID): Promise<Assessment> {
  const { data } = await api.get<Assessment>(`/assessments/${id}`);
  return data;
}

export async function listAssessments(params: {
  newcomerId?: ID;
  mentorId?: ID;
  status?: string;
}): Promise<Assessment[]> {
  const { data } = await api.get<Assessment[]>("/assessments", {
    params: {
      newcomer_id: params.newcomerId,
      mentor_id: params.mentorId,
      status: params.status,
    },
  });
  return data;
}

export async function patchAssessment(
  id: ID,
  patch: { title?: string; mentor_notes?: string; role_context?: string },
): Promise<Assessment> {
  const { data } = await api.patch<Assessment>(`/assessments/${id}`, patch);
  return data;
}

export async function addQuestion(
  assessmentId: ID,
  payload: QuestionPayload,
): Promise<AssessmentQuestion> {
  const { data } = await api.post<AssessmentQuestion>(
    `/assessments/${assessmentId}/questions`,
    payload,
  );
  return data;
}

export async function updateQuestion(
  assessmentId: ID,
  questionId: ID,
  patch: Partial<QuestionPayload>,
): Promise<AssessmentQuestion> {
  const { data } = await api.patch<AssessmentQuestion>(
    `/assessments/${assessmentId}/questions/${questionId}`,
    patch,
  );
  return data;
}

export async function deleteQuestion(
  assessmentId: ID,
  questionId: ID,
): Promise<void> {
  await api.delete(`/assessments/${assessmentId}/questions/${questionId}`);
}

export async function publishAssessment(
  assessmentId: ID,
  newcomerId: ID,
): Promise<Assessment> {
  const { data } = await api.patch<Assessment>(
    `/assessments/${assessmentId}/publish`,
    { newcomer_id: newcomerId },
  );
  return data;
}

export async function getActiveAssessmentForNewcomer(
  newcomerId: ID,
): Promise<Assessment | null> {
  const { data } = await api.get<Assessment | null>(
    `/assessments/by-newcomer/${newcomerId}`,
  );
  return data;
}

export async function submitAssessment(
  assessmentId: ID,
  input: AssessmentSubmissionInput,
): Promise<AssessmentSubmission> {
  const { data } = await api.post<AssessmentSubmission>(
    `/assessments/${assessmentId}/submit`,
    input,
  );
  return data;
}

export async function getAssessmentSubmission(
  assessmentId: ID,
): Promise<AssessmentSubmission | null> {
  const { data } = await api.get<AssessmentSubmission | null>(
    `/assessments/${assessmentId}/submission`,
  );
  return data;
}

export async function updateAnswerMentorScore(
  assessmentId: ID,
  answerId: ID,
  patch: { mentor_score?: number | null; mentor_feedback?: string | null },
): Promise<AssessmentSubmission> {
  const { data } = await api.patch<AssessmentSubmission>(
    `/assessments/${assessmentId}/answers/${answerId}`,
    patch,
  );
  return data;
}
