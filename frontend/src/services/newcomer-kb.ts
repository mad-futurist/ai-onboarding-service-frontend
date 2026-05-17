import { api } from "@/lib/api";
import type {
  AIAskResponse,
  DocumentItem,
  ID,
  MindMapResponse,
  NewcomerDocument,
} from "@/types";

export async function listNewcomerDocuments(newcomerId: ID): Promise<DocumentItem[]> {
  const { data } = await api.get<DocumentItem[]>(
    `/newcomer-kb/${newcomerId}/documents`,
  );
  return data;
}

export async function getNewcomerDocument(
  newcomerId: ID,
  documentId: ID,
): Promise<NewcomerDocument> {
  const { data } = await api.get<NewcomerDocument>(
    `/newcomer-kb/${newcomerId}/documents/${documentId}`,
  );
  return data;
}

export async function askAboutDocument(
  newcomerId: ID,
  documentId: ID,
  question: string,
  options: { userId?: ID; conversationId?: ID } = {},
): Promise<AIAskResponse> {
  const { data } = await api.post<AIAskResponse>(
    `/newcomer-kb/${newcomerId}/documents/${documentId}/ask`,
    { question, user_id: options.userId, conversation_id: options.conversationId },
  );
  return data;
}

export async function generateDocumentMindMap(
  newcomerId: ID,
  documentId: ID,
): Promise<MindMapResponse> {
  const { data } = await api.post<MindMapResponse>(
    `/newcomer-kb/${newcomerId}/documents/${documentId}/mindmap`,
  );
  return data;
}
