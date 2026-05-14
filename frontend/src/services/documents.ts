import { api } from "@/lib/api";
import type { DocumentItem, KnowledgeBaseResponse, ID } from "@/types";

export async function getKnowledgeBase(): Promise<KnowledgeBaseResponse> {
  const { data } = await api.get<KnowledgeBaseResponse>("/documents/knowledge-base");
  return data;
}

export async function listDocuments(params?: {
  domain?: string;
  role_target?: string;
  scope?: string;
}): Promise<DocumentItem[]> {
  const { data } = await api.get<DocumentItem[]>("/documents/", { params });
  return data;
}

export interface CreateDocumentInput {
  title: string;
  content: string;
  source: string;
  document_type: string;
  domain: string;
  role_target: string;
  scope: string;
}

export async function createDocument(input: CreateDocumentInput): Promise<DocumentItem> {
  const { data } = await api.post<DocumentItem>("/documents/", input);
  return data;
}
