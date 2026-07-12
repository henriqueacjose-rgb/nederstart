import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/levels", label: "Levels" },
  { href: "/search", label: "Search" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
  { href: "/beta-check", label: "Beta Check" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-background">
      <header className="sticky top-0 z-10 border-b border-brand-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-3 font-bold text-brand-text">
            <span className="flex h-10 w-10 items-center justify-center rounded-component bg-brand-primary text-white">
              NS
            </span>
            <span>NederStart</span>
          </Link>
          <form action={logoutAction}>
            <button className="text-sm font-semibold text-brand-muted hover:text-brand-primary" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-component px-3 py-2 text-sm font-semibold text-brand-muted hover:bg-white hover:text-brand-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 pb-20 md:pb-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-brand-border bg-white md:hidden">
        {navItems.filter((item) => item.href !== "/beta-check").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-14 items-center justify-center text-xs font-semibold text-brand-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
