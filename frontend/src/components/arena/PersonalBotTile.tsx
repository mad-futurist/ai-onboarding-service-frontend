"use client";

import { motion } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";

interface PersonalBotTileProps {
  onCreate: () => void;
}

export function PersonalBotTile({ onCreate }: PersonalBotTileProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onClick={onCreate}
      className="ai-gradient group relative flex h-full min-h-[220px] flex-col items-start gap-3 overflow-hidden rounded-2xl p-5 text-left text-white shadow-[var(--shadow-card)]"
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
        <Bot className="h-6 w-6" />
      </div>

      <div className="relative space-y-1">
        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" /> Built for you
        </div>
        <h3 className="text-base font-semibold leading-tight">Forge a Personal Bot</h3>
        <p className="text-xs text-white/85">
          Mines your weak dimensions and crafts a client persona that pushes exactly there.
        </p>
      </div>

      <div className="relative mt-auto">
        <span className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-white/95 px-3 text-xs font-medium text-[color:var(--color-fg)] shadow-sm transition-colors group-hover:bg-white">
          Build my bot
        </span>
      </div>
    </motion.button>
  );
}
