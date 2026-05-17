"use client";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HistoryToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function HistoryToggle({ visible, onToggle }: HistoryToggleProps) {
  const Icon = visible ? EyeOff : Eye;
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onToggle}
      title={visible ? "Hide conversation history" : "Show conversation history"}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{visible ? "Hide history" : "Show history"}</span>
    </Button>
  );
}
