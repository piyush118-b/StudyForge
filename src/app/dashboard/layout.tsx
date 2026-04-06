"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { AchievementModal } from "@/components/dashboard/AchievementModal";
import { LiveWorkspaceShell } from "@/components/dashboard/LiveWorkspaceShell";

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LiveWorkspaceShell>
        {children}
      </LiveWorkspaceShell>
      <AchievementModal />
    </ErrorBoundary>
  );
}
