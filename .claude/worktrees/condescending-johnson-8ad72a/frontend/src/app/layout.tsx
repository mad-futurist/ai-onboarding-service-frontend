import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { QueryProvider } from "@/providers/query-provider";
import { DemoProvider } from "@/providers/demo-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onbord — AI onboarding for teams",
  description:
    "AI-powered onboarding for new hires. Mentors generate personalized 30/60/90 plans, detect friction, and adapt — newcomers get the answers they need with sources.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">
        <QueryProvider>
          <DemoProvider>
            <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
          </DemoProvider>
        </QueryProvider>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "rounded-xl border shadow-[var(--shadow-elevated)]",
            },
          }}
        />
      </body>
    </html>
  );
}
