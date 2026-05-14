import { api } from "@/lib/api";
import type { User, ID } from "@/types";

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users/");
  return data;
}

export async function getUser(id: ID): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
}
