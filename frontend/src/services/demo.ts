import { api } from "@/lib/api";
import type { DemoSeedResponse } from "@/types";

export async function seedDemo(): Promise<DemoSeedResponse> {
  const { data } = await api.post<DemoSeedResponse>("/demo/seed");
  return data;
}
