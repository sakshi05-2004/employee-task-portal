"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { initials } from "@/lib/format";
import type { CurrentUser, Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/tasks/board", label: "Board" },
    { href: "/admin/tasks/list", label: "Tasks" },
    { href: "/admin/employees/list", label: "Employees" },
    { href: "/admin/reports", label: "Reports" },
  ],
  employee: [
    { href: "/employee", label: "My Board" },
    { href: "/employee/reports", label: "My Reports" },
  ],
};

export default function Navbar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setUser(data.user);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const items = NAV_ITEMS[role];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={role === "admin" ? "/admin" : "/employee"}>
          <Logo size={34} />
        </Link>

        <nav className="no-scrollbar hidden items-center gap-1 overflow-x-auto md:flex">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/employee" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink-800 leading-tight">
              {user?.name || "…"}
            </p>
            <p className="text-xs capitalize text-ink-400 leading-tight">
              {user?.role || role}
            </p>
          </div>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
            {initials(user?.name)}
          </span>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-ink-100 p-2 text-ink-500 md:hidden"
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/change-password"
              className="rounded-lg border border-ink-100 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              Change Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-white hover:bg-ink-800"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-600 hover:bg-ink-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/change-password"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              Change Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 rounded-lg bg-ink-900 px-3 py-2 text-left text-sm font-medium text-white"
            >
              Log Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
