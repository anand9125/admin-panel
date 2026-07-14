import { redirect } from "next/navigation";
import { auth, emailAllowed } from "@/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email;
  if (!emailAllowed(email)) redirect("/login");
  return <DashboardShell email={email!}>{children}</DashboardShell>;
}
