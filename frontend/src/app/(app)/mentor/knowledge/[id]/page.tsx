"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { deleteDocument, getDocument, updateDocument } from "@/services/documents";
import { toApiError } from "@/lib/api";

const DOMAIN_OPTIONS = ["engineering", "hr", "product", "finance", "security", "general"];
const TYPE_OPTIONS = ["guide", "handbook", "policy", "runbook", "checklist", "reference"];
const SCOPE_OPTIONS = ["onboarding", "enterprise", "team", "role"];
const ROLE_OPTIONS = [
  "all",
  "backend_developer",
  "frontend_developer",
  "qa",
  "data_scientist",
  "designer",
  "product_manager",
];

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const router = useRouter();
  const qc = useQueryClient();

  const doc = useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocument(id),
    enabled: Number.isFinite(id),
  });

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [externalUrl, setExternalUrl] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [docType, setDocType] = React.useState("");
  const [scope, setScope] = React.useState("");
  const [roleTarget, setRoleTarget] = React.useState("");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (doc.data) {
      setTitle(doc.data.title);
      setContent(doc.data.content ?? "");
      setExternalUrl(doc.data.external_url ?? "");
      setDomain(doc.data.domain ?? "general");
      setDocType(doc.data.document_type ?? "guide");
      setScope(doc.data.scope ?? "onboarding");
      setRoleTarget(doc.data.role_target ?? "all");
      setDirty(false);
    }
  }, [doc.data]);

  const saveMut = useMutation({
    mutationFn: () =>
      updateDocument(id, {
        title,
        content,
        external_url: externalUrl || undefined,
        domain,
        document_type: docType,
        scope,
        role_target: roleTarget,
      }),
    onSuccess: () => {
      toast.success("Document updated");
      qc.invalidateQueries({ queryKey: ["document", id] });
      qc.invalidateQueries({ queryKey: ["documents-list"] });
      setDirty(false);
    },
    onError: (err) => toast.error("Save failed", { description: toApiError(err).message }),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteDocument(id),
    onSuccess: () => {
      toast.success("Document deleted");
      qc.invalidateQueries({ queryKey: ["documents-list"] });
      router.push("/mentor/knowledge");
    },
    onError: (err) => toast.error("Delete failed", { description: toApiError(err).message }),
  });

  if (doc.isLoading || !doc.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  const isExternal = doc.data.source_type && doc.data.source_type !== "text";

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
        eyebrow="Document"
        title={doc.data.title}
        description="Edit the metadata or content. Changes apply immediately."
        actions={
          <div className="flex items-center gap-2">
            {isExternal && doc.data.external_url ? (
              <Button asChild size="sm" variant="outline">
                <a href={doc.data.external_url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Open source
                </a>
              </Button>
            ) : null}
            <Button size="sm" onClick={() => saveMut.mutate()} disabled={!dirty || saveMut.isPending}>
              <Save className="h-3.5 w-3.5" />
              {saveMut.isPending ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {doc.data.source_type ? <Badge tone="ai" size="sm">{doc.data.source_type}</Badge> : null}
        {doc.data.scope ? <Badge tone="brand" size="sm">{doc.data.scope}</Badge> : null}
        {doc.data.document_type ? <Badge tone="neutral" size="sm">{doc.data.document_type}</Badge> : null}
        {doc.data.domain ? <Badge tone="neutral" size="sm">{doc.data.domain}</Badge> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Used to filter docs and as context for the AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Domain" value={domain} onChange={(v) => { setDomain(v); setDirty(true); }} options={DOMAIN_OPTIONS} />
            <SelectField label="Type" value={docType} onChange={(v) => { setDocType(v); setDirty(true); }} options={TYPE_OPTIONS} />
            <SelectField label="Scope" value={scope} onChange={(v) => { setScope(v); setDirty(true); }} options={SCOPE_OPTIONS} />
            <SelectField label="Role target" value={roleTarget} onChange={(v) => { setRoleTarget(v); setDirty(true); }} options={ROLE_OPTIONS} />
          </div>
          {isExternal ? (
            <div className="space-y-1.5">
              <Label htmlFor="external-url">External URL</Label>
              <Input
                id="external-url"
                value={externalUrl}
                onChange={(e) => {
                  setExternalUrl(e.target.value);
                  setDirty(true);
                }}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>
            {isExternal
              ? "Optional summary for the AI when the external content isn't ingested yet."
              : "The exact text the AI will index and retrieve."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={12}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
          />
        </CardContent>
      </Card>
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
