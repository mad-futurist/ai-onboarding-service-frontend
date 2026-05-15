"use client";

const COLORS = ["#10B981", "#F97316", "#EC4899", "#8B5CF6", "#FBBF24"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
}

let firedRecently = 0;

export function fireConfetti(opts?: { count?: number; durationMs?: number }) {
  if (typeof window === "undefined") return;
  // Respect reduced motion + throttle so a burst of signals doesn't flood the screen.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const now = performance.now();
  if (now - firedRecently < 1500) return;
  firedRecently = now;

  const count = opts?.count ?? 50;
  const duration = opts?.durationMs ?? 900;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const cx = canvas.width / 2;
  const cy = canvas.height / 3;

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 6;
    return {
      x: cx + (Math.random() - 0.5) * 80,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      size: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    };
  });

  const start = performance.now();
  let raf = 0;
  const tick = (t: number) => {
    const elapsed = t - start;
    const progress = elapsed / duration;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.vy += 0.18;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life = Math.max(0, 1 - progress);
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (progress < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(tick);
}
