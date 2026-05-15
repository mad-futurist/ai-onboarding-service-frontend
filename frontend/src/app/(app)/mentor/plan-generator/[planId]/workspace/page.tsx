"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

// Legacy /workspace route — the workspace is now merged into [planId]/page.tsx.
// Redirect to keep old links working.
export default function LegacyWorkspaceRedirect() {
  const params = useParams<{ planId: string }>();
  const router = useRouter();
  React.useEffect(() => {
    router.replace(`/mentor/plan-generator/${params.planId}`);
  }, [params.planId, router]);
  return null;
}
