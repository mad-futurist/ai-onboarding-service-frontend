import axios, { AxiosError } from "axios";

function normalizeBaseUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : undefined;
}

export const apiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE) ?? "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

export type ApiError = {
  message: string;
  status?: number;
  detail?: unknown;
};

export function toApiError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { detail?: string | unknown[] } | undefined;
    let message = err.message;
    if (data?.detail) {
      message =
        typeof data.detail === "string"
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((d) => (typeof d === "string" ? d : JSON.stringify(d))).join(", ")
            : JSON.stringify(data.detail);
    }
    return { message, status: err.response?.status, detail: data?.detail };
  }
  if (err instanceof Error) return { message: err.message };
  return { message: "Unknown error" };
}
