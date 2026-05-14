"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { makeQueryClient } from "@/lib/query-client";

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const client = getQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
