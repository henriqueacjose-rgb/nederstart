import { AppShell } from "@/components/navigation/app-shell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
