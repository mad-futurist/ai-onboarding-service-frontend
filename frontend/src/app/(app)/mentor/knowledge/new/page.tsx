"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, FileText, Link as LinkIcon, GitBranch } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { createDocument } from "@/services/documents";
import { toApiError } from "@/lib/api";

const DOMAIN_OPTIONS = [
  "engineering",
  "hr",
  "product",
  "finance",
  "security",
  "general",
];
const TYPE_OPTIONS = ["guide", "handbook", "policy", "runbook", "checklist", "reference"];
const SCOPE_OPTIONS = ["onboarding", "enterprise", "team", "role"];
const ROLE_OPTIONS = ["all", "backend_developer", "frontend_developer", "qa", "data_scientist", "designer", "product_manager"];

type Mode = "text" | "url" | "github_link";

export default function AddDocumentPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("text");

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [externalUrl, setExternalUrl] = React.useState("");
  const [domain, setDomain] = React.useState("engineering");
  const [docType, setDocType] = React.useState("guide");
  const [scope, setScope] = React.useState("onboarding");
  const [roleTarget, setRoleTarget] = React.useState("all");

  const createMut = useMutation({
    mutationFn: () =>
      createDocument({
        title: title.trim(),
        content: mode === "text" ? content.trim() : "",
        external_url: mode === "text" ? undefined : externalUrl.trim(),
        source: mode === "text" ? "manual_upload" : externalUrl.trim(),
        source_type: mode,
        document_type: docType,
        domain,
        role_target: roleTarget,
        scope,
      }),
    onSuccess: (doc) => {
      toast.success("Document added");
      router.push(`/mentor/knowledge/${doc.id}`);
    },
    onError: (err) => toast.error("Couldn't add document", { description: toApiError(err).message }),
  });

  const canSubmit =
    title.trim().length > 0 &&
    (mode === "text" ? content.trim().length > 0 : externalUrl.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <Link
          href="/mentor/knowledge"
          className="inline-flex items-center gap-1 text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]"
        >
          <ArrowLeft className="h-3 w-3" /> Back to knowledge base
        </Link>
      </div>

      <PageHeader
        eyebrow="Knowledge base"
        title="Add a document"
        description="Paste a document, link a URL, or reference a GitHub repository. The AI will index it for grounded answers and plans."
      />

      <Card>
        <CardHeader>
          <CardTitle>Source</CardTitle>
          <CardDescription>Choose how the AI should reach the content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="text"><FileText className="h-3.5 w-3.5" /> Paste text</TabsTrigger>
              <TabsTrigger value="url"><LinkIcon className="h-3.5 w-3.5" /> URL</TabsTrigger>
              <TabsTrigger value="github_link"><GitBranch className="h-3.5 w-3.5" /> GitHub link</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="text-content">Content</Label>
                <Textarea
                  id="text-content"
                  rows={8}
                  placeholder="Paste your document content here…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/handbook"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
                <p className="text-xs text-[color:var(--color-fg-muted)]">
                  Phase 1: the URL is stored as metadata. Automated ingestion ships in Phase 2.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="github_link" className="space-y-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="gh">GitHub URL</Label>
                <Input
                  id="gh"
                  placeholder="https://github.com/owner/repo"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
                <p className="text-xs text-[color:var(--color-fg-muted)]">
                  Phase 1: the repo link is stored. Full ingestion (README, docs, signals) ships in Phase 2.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>The AI uses these fields to filter docs by team and role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Deployment guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Domain" value={domain} onChange={setDomain} options={DOMAIN_OPTIONS} />
            <SelectField label="Type" value={docType} onChange={setDocType} options={TYPE_OPTIONS} />
            <SelectField label="Scope" value={scope} onChange={setScope} options={SCOPE_OPTIONS} />
            <SelectField label="Role target" value={roleTarget} onChange={setRoleTarget} options={ROLE_OPTIONS} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="ai"
          size="lg"
          disabled={!canSubmit || createMut.isPending}
          onClick={() => createMut.mutate()}
        >
          <Plus className="h-4 w-4" />
          {createMut.isPending ? "Adding…" : "Add to knowledge base"}
        </Button>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
