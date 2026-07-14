import { DashboardShell } from "@/components/dashboard-shell";

// Auth is disabled for now — the panel is open. Re-add a login gate before
// wiring a real OPS_SERVICE_TOKEN into a public deployment.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
