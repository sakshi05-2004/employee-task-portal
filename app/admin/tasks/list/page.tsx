"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { formatDate, isOverdue } from "@/lib/format";
import type { Task, TaskStatus } from "@/lib/types";

export default function TaskListPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadTasks() {
    try {
      const response = await fetch("/api/admin/tasks");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load tasks");
        return;
      }

      setTasks(data.tasks);
    } catch {
      setMessage("Something went wrong while loading tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const searchText = search.toLowerCase().trim();

    const filtered = tasks.filter((task) => {
      const matchesSearch =
        !searchText ||
        task.title.toLowerCase().includes(searchText) ||
        (task.description || "").toLowerCase().includes(searchText) ||
        (task.assignedTo?.name || "").toLowerCase().includes(searchText);

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredTasks(filtered);
  }, [tasks, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Tasks</h1>
          <p className="mt-1 text-sm text-ink-500">
            View and manage every task across the team.
          </p>
        </div>
        <Link
          href="/admin/tasks"
          className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
        >
          + Create Task
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search task or employee…"
          className="min-w-[240px] flex-1 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">All Statuses</option>
          <option value="pending">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading && <p className="text-sm text-ink-400">Loading tasks…</p>}
      {message && (
        <p className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-600">
          {message}
        </p>
      )}

      {!loading && !message && (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-50">
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="cursor-pointer hover:bg-brand-50/40"
                    onClick={() => router.push(`/admin/tasks/${task._id}`)}
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/tasks/${task._id}`}
                        className="font-semibold text-ink-900 hover:text-brand-700"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <div className="mt-1 line-clamp-1 text-xs text-ink-400">
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-ink-600">
                      {task.assignedTo?.name || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td
                      className={`px-5 py-4 ${
                        isOverdue(task.dueDate, task.status)
                          ? "font-semibold text-danger-600"
                          : "text-ink-600"
                      }`}
                    >
                      {formatDate(task.dueDate)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-400">
              No tasks found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
