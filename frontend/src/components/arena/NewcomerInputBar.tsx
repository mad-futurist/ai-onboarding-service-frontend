"use client";

import * as React from "react";
import { SendHorizonal, CircleStop } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NewcomerInputBarProps {
  onSend: (text: string) => void;
  onEnd: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  endDisabled?: boolean;
  endLabel?: string;
}

export function NewcomerInputBar({
  onSend,
  onEnd,
  isStreaming,
  disabled,
  endDisabled,
  endLabel = "End session",
}: NewcomerInputBarProps) {
  const [value, setValue] = React.useState("");
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue("");
    ref.current?.focus();
  };

  return (
    <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 sm:px-6">
      <div className="flex items-end gap-2">
        <Textarea
          data-demo-id="arena-session-input"
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder={
            disabled
              ? "Session ended"
              : isStreaming
                ? "Client is responding…"
                : "Type your next line. Enter to send, Shift+Enter for newline."
          }
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="min-h-[56px] resize-none"
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="ai"
            size="icon"
            onClick={submit}
            disabled={isStreaming || disabled || !value.trim()}
            aria-label="Send"
            data-demo-id="arena-session-send"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onEnd}
            disabled={endDisabled}
            aria-label={endLabel}
            title={endLabel}
          >
            <CircleStop className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
