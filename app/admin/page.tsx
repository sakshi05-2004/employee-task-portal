"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalReports: number;
  reportsAwaitingComment: number;
}

const STATUS_SEGMENTS = [
  { key: "pendingTasks", label: "To Do", color: "bg-danger-500", swatch: "bg-danger-500" },
  { key: "inProgressTasks", label: "In Progress", color: "bg-warning-500", swatch: "bg-warning-500" },
  { key: "completedTasks", label: "Completed", color: "bg-success-500", swatch: "bg-success-500" },
] as const;

const QUICK_LINKS = [
  { title: "Kanban Board", description: "Drag tasks across every stage", href: "/admin/tasks/board" },
  { title: "Create Task", description: "Assign a new task to an employee", href: "/admin/tasks" },
  { title: "All Tasks", description: "Search, filter and open task details", href: "/admin/tasks/list" },
  { title: "Employees", description: "Manage accounts and reset passwords", href: "/admin/employees/list" },
  { title: "Add Employee", description: "Create a new employee account", href: "/admin/employees" },
  { title: "Reports", description: "Review submissions and leave feedback", href: "/admin/reports" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
        else setMessage(data.message || "Failed to load dashboard stats");
      })
      .catch(() => setMessage("Failed to load dashboard stats"));
  }, []);

  const total = stats?.totalTasks || 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">
          A snapshot of the team&apos;s work across Startup Stairs.
        </p>
      </div>

      {message && (
        <p className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-600">
          {message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Active employees" value={stats?.activeEmployees} suffix={`/ ${stats?.totalEmployees ?? "…"}`} />
        <StatTile label="Total tasks" value={stats?.totalTasks} />
        <StatTile
          label="Overdue tasks"
          value={stats?.overdueTasks}
          tone={stats && stats.overdueTasks > 0 ? "danger" : "default"}
        />
        <StatTile
          label="Reports awaiting reply"
          value={stats?.reportsAwaitingComment}
          suffix={`/ ${stats?.totalReports ?? "…"}`}
        />
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-800">
            Task status breakdown
          </h2>
          <span className="text-xs text-ink-400">{total} total tasks</span>
        </div>

        {total > 0 ? (
          <>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-ink-50">
              {STATUS_SEGMENTS.map((segment, index) => {
                const value = stats ? stats[segment.key] : 0;
                const pct = total > 0 ? (value / total) * 100 : 0;
                if (pct === 0) return null;

                return (
                  <div
                    key={segment.key}
                    className={`${segment.color} h-full`}
                    style={{
                      width: `${pct}%`,
                      marginLeft: index === 0 ? 0 : 2,
                    }}
                    title={`${segment.label}: ${value} (${pct.toFixed(0)}%)`}
                  />
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {STATUS_SEGMENTS.map((segment) => {
                const value = stats ? stats[segment.key] : 0;
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;

                return (
                  <div key={segment.key} className="flex items-center gap-2 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${segment.swatch}`} />
                    <span className="font-medium text-ink-700">{segment.label}</span>
                    <span className="text-ink-400">
                      {value} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-ink-400">No tasks created yet.</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-800">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <h3 className="font-semibold text-ink-900 group-hover:text-brand-700">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-ink-500">{link.description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-600">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix,
  tone = "default",
}: {
  label: string;
  value?: number;
  suffix?: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p
        className={`mt-1.5 text-2xl font-semibold ${
          tone === "danger" && value ? "text-danger-600" : "text-ink-900"
        }`}
      >
        {value ?? "—"}
        {suffix && (
          <span className="ml-1 text-sm font-medium text-ink-400">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
