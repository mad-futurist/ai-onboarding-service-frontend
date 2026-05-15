"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import dagre from "dagre";
import { motion } from "framer-motion";
import { Sparkles, RefreshCcw, Network } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemo } from "@/providers/demo-provider";
import { generateDocumentMindMap } from "@/services/newcomer-kb";
import { toApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ID, MindMapResponse } from "@/types";

import "@xyflow/react/dist/style.css";

interface DocumentMindMapProps {
  documentId: ID;
}

type NodeKind = "root" | "branch" | "leaf";

interface MindMapNodeData extends Record<string, unknown> {
  label: string;
  kind: NodeKind;
}

const NODE_WIDTH_BY_KIND: Record<NodeKind, number> = {
  root: 220,
  branch: 200,
  leaf: 180,
};

const NODE_HEIGHT_BY_KIND: Record<NodeKind, number> = {
  root: 64,
  branch: 52,
  leaf: 44,
};

function layoutMindMap(
  data: MindMapResponse,
): { nodes: Node<MindMapNodeData>[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 32, ranksep: 80, marginx: 24, marginy: 24 });

  data.nodes.forEach((n) => {
    const kind = (n.kind as NodeKind) ?? "leaf";
    g.setNode(n.id, {
      width: NODE_WIDTH_BY_KIND[kind] ?? NODE_WIDTH_BY_KIND.leaf,
      height: NODE_HEIGHT_BY_KIND[kind] ?? NODE_HEIGHT_BY_KIND.leaf,
    });
  });
  data.edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  const nodes: Node<MindMapNodeData>[] = data.nodes.map((n) => {
    const kind = ((n.kind as NodeKind) ?? "leaf") as NodeKind;
    const pos = g.node(n.id);
    const w = NODE_WIDTH_BY_KIND[kind];
    const h = NODE_HEIGHT_BY_KIND[kind];
    return {
      id: n.id,
      type: "mindmap",
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
      data: { label: n.label, kind },
    };
  });

  const edges: Edge[] = data.edges.map((e, idx) => ({
    id: `e-${idx}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: true,
    style: { stroke: "url(#mm-grad)", strokeWidth: 1.5 },
  }));

  return { nodes, edges };
}

function MindMapNodeComponent({ data }: NodeProps) {
  const kind = (data as MindMapNodeData).kind ?? "leaf";
  const label = (data as MindMapNodeData).label ?? "";
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-2 text-center text-sm font-medium shadow-[var(--shadow-card)] border",
        kind === "root" &&
          "ai-gradient text-white border-transparent text-base font-semibold shadow-[var(--shadow-ai)]",
        kind === "branch" &&
          "ai-gradient-soft text-[color:var(--color-primary-active)] border-[color:var(--color-primary-ring)]",
        kind === "leaf" &&
          "bg-white text-[color:var(--color-fg)] border-[color:var(--color-border)]",
      )}
      style={{
        width: NODE_WIDTH_BY_KIND[kind as NodeKind] - 8,
        minHeight: NODE_HEIGHT_BY_KIND[kind as NodeKind] - 8,
      }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <div className="flex h-full items-center justify-center leading-snug">{label}</div>
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  );
}

const nodeTypes = { mindmap: MindMapNodeComponent };

export function DocumentMindMap({ documentId }: DocumentMindMapProps) {
  const { newcomerId } = useDemo();
  const [data, setData] = React.useState<MindMapResponse | null>(null);

  const mut = useMutation({
    mutationFn: () => generateDocumentMindMap(newcomerId as ID, documentId),
    onSuccess: (resp) => setData(resp),
    onError: (e) => toast.error("Mind map failed", { description: toApiError(e).message }),
  });

  const flow = React.useMemo(() => (data ? layoutMindMap(data) : null), [data]);

  if (!data && !mut.isPending) {
    return (
      <div className="ai-border rounded-2xl">
        <div className="relative overflow-hidden rounded-2xl bg-white p-10 text-center shadow-[var(--shadow-elevated)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ai-gradient opacity-20 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 -bottom-12 h-40 w-40 rounded-full ai-gradient-soft opacity-80 blur-2xl" />
          <div className="relative mx-auto max-w-md space-y-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl ai-gradient text-white shadow-[var(--shadow-ai)]"
            >
              <Network className="h-6 w-6" />
            </motion.div>
            <h3 className="text-lg font-semibold">
              <span className="ai-gradient-text">Visualize this document</span>
            </h3>
            <p className="text-sm text-[color:var(--color-fg-muted)]">
              Generate an interactive mind map. AI will extract the central topic and its main branches so you can see how it all fits together at a glance.
            </p>
            <Button variant="ai" onClick={() => mut.mutate()} disabled={!newcomerId}>
              <Sparkles className="h-4 w-4" /> Generate mind map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (mut.isPending) {
    return (
      <div className="ai-border rounded-2xl">
        <div className="relative overflow-hidden rounded-2xl bg-white p-10 text-center shadow-[var(--shadow-elevated)]">
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 12, -12, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl ai-gradient text-white shadow-[var(--shadow-ai)]"
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>
          <div className="mt-4 text-sm font-medium">Building your mind map…</div>
          <div className="mx-auto mt-3 max-w-sm space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!flow) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-[color:var(--color-fg-muted)]">
          Central topic:{" "}
          <span className="ai-gradient-text font-semibold">{data!.root}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mut.mutate()}
          disabled={mut.isPending}
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Regenerate
        </Button>
      </div>
      <div className="ai-border rounded-2xl">
        <div className="relative h-[560px] overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-elevated)]">
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="mm-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="55%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <ReactFlow
            nodes={flow.nodes}
            edges={flow.edges}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#f3e8ff" />
            <Controls showInteractive={false} className="!bg-white !border-[color:var(--color-border)]" />
            <MiniMap pannable zoomable className="!bg-white !border !border-[color:var(--color-border)]" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
