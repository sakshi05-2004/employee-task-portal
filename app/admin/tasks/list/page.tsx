"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { formatDate, isOverdue } from "@/lib/format";
import type { Task, TaskStatus } from "@/lib/types";

interface EmployeeOption {
  _id: string;
  name: string;
}

type DateFilter =
  | "all"
  | "today"
  | "7days"
  | "15days"
  | "30days"
  | "custom";

function TaskListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<TaskStatus | "all">("all");

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");

  const [overdueOnly, setOverdueOnly] = useState(
    searchParams.get("filter") === "overdue"
  );

  const [pendingOnly, setPendingOnly] = useState(
    searchParams.get("filter") === "pending"
  );

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

      const employeeMap = new Map<string, EmployeeOption>();

      data.tasks.forEach((task: Task) => {
        if (task.assignedTo?._id && task.assignedTo?.name) {
          employeeMap.set(task.assignedTo._id, {
            _id: task.assignedTo._id,
            name: task.assignedTo.name,
          });
        }
      });

      setEmployees(
        Array.from(employeeMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
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
    const filtered = tasks.filter((task) => {
      const matchesEmployee =
        employeeFilter === "all" ||
        task.assignedTo?._id === employeeFilter;

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesOverdue =
        !overdueOnly || isOverdue(task.dueDate, task.status);

      const matchesPending =
        !pendingOnly || task.status === "pending";

      const taskCreatedDate = new Date(task.createdAt);
      const now = new Date();

      let matchesDate = true;

      if (dateFilter !== "all") {
        if (dateFilter === "today") {
          const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          const endOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );

          matchesDate =
            taskCreatedDate >= startOfToday &&
            taskCreatedDate < endOfToday;
        }

        if (dateFilter === "7days") {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);

          matchesDate = taskCreatedDate >= startDate;
        }

        if (dateFilter === "15days") {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 14);
          startDate.setHours(0, 0, 0, 0);

          matchesDate = taskCreatedDate >= startDate;
        }

        if (dateFilter === "30days") {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);

          matchesDate = taskCreatedDate >= startDate;
        }

        if (
          dateFilter === "custom" &&
          customFromDate &&
          customToDate
        ) {
          const fromDate = new Date(`${customFromDate}T00:00:00`);
          const toDate = new Date(`${customToDate}T23:59:59.999`);

          matchesDate =
            taskCreatedDate >= fromDate &&
            taskCreatedDate <= toDate;
        }
      }

      return (
        matchesEmployee &&
        matchesStatus &&
        matchesOverdue &&
        matchesPending &&
        matchesDate
      );
    });

    setFilteredTasks(filtered);
  }, [
    tasks,
    employeeFilter,
    statusFilter,
    overdueOnly,
    pendingOnly,
    dateFilter,
    customFromDate,
    customToDate,
  ]);

  function clearFilter() {
    setOverdueOnly(false);
    setPendingOnly(false);
    setEmployeeFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
    setCustomFromDate("");
    setCustomToDate("");

    router.push("/admin/tasks/list");
  }

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
        {/* Employee Filter */}
        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="min-w-[200px] rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">All Employees</option>

          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(e.target.value as DateFilter)
          }
          className="min-w-[170px] rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="15days">Last 15 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="custom">Custom Date</option>
        </select>

        {/* Custom Date Range */}
        {dateFilter === "custom" && (
          <>
            <input
              type="date"
              value={customFromDate}
              onChange={(e) => setCustomFromDate(e.target.value)}
              className="rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />

            <span className="flex items-center text-sm text-ink-400">
              to
            </span>

            <input
              type="date"
              value={customToDate}
              onChange={(e) => setCustomToDate(e.target.value)}
              className="rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </>
        )}

        {/* Pending Filter */}
        {pendingOnly && (
          <button
            type="button"
            onClick={clearFilter}
            className="rounded-xl border border-warning-200 bg-warning-50 px-3.5 py-2.5 text-sm font-semibold text-warning-700 hover:bg-warning-100"
          >
            Showing Pending
          </button>
        )}

        {/* Overdue Filter */}
        {overdueOnly && (
          <button
            type="button"
            onClick={clearFilter}
            className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-sm font-semibold text-danger-600 hover:bg-danger-100"
          >
            Showing Overdue
          </button>
        )}

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TaskStatus | "all")
          }
          className="min-w-[150px] rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">All Statuses</option>
          <option value="pending">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Clear All Filters */}
        {(employeeFilter !== "all" ||
          dateFilter !== "all" ||
          statusFilter !== "all" ||
          overdueOnly ||
          pendingOnly) && (
          <button
            type="button"
            onClick={clearFilter}
            className="rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-ink-400">Loading tasksâ€¦</p>
      )}

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
                    onClick={() =>
                      router.push(`/admin/tasks/${task._id}`)
                    }
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/tasks/${task._id}`}
                        className="font-semibold text-ink-900 hover:text-brand-700"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
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


export default function TaskListPage() {
  return (
    <Suspense fallback={<div className="text-sm text-ink-400">Loading tasks...</div>}>
      <TaskListPageContent />
    </Suspense>
  );
}
