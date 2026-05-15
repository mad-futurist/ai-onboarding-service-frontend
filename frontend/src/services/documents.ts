import { api } from "@/lib/api";
import type { DocumentItem, KnowledgeBaseResponse, ID } from "@/types";

export async function getKnowledgeBase(): Promise<KnowledgeBaseResponse> {
  const { data } = await api.get<KnowledgeBaseResponse>("/documents/knowledge-base");
  return data;
}

export interface ListDocumentsParams {
  domain?: string;
  role_target?: string;
  scope?: string;
  document_type?: string;
  source_type?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export async function listDocuments(params?: ListDocumentsParams): Promise<DocumentItem[]> {
  const { data } = await api.get<DocumentItem[]>("/documents/", { params });
  return data;
}

export async function getDocument(id: ID): Promise<DocumentItem> {
  const { data } = await api.get<DocumentItem>(`/documents/${id}`);
  return data;
}

export interface CreateDocumentInput {
  title: string;
  content?: string;
  source?: string;
  document_type?: string;
  domain?: string;
  role_target?: string;
  scope?: string;
  source_type?: string;
  external_url?: string;
}

export async function createDocument(input: CreateDocumentInput): Promise<DocumentItem> {
  const { data } = await api.post<DocumentItem>("/documents/", input);
  return data;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  source?: string;
  document_type?: string;
  domain?: string;
  role_target?: string;
  scope?: string;
  source_type?: string;
  external_url?: string;
}

export async function updateDocument(id: ID, input: UpdateDocumentInput): Promise<DocumentItem> {
  const { data } = await api.patch<DocumentItem>(`/documents/${id}`, input);
  return data;
}

export async function deleteDocument(id: ID): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export interface ClassifyDocumentResponse {
  title: string;
  summary: string;
  domain: string;
  document_type: string;
  source_type: string;
}

export async function classifyDocument(input: {
  content: string;
  title?: string;
}): Promise<ClassifyDocumentResponse> {
  const { data } = await api.post<ClassifyDocumentResponse>("/documents/ai-classify", input);
  return data;
}
