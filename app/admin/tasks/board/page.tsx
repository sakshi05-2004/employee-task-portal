"use client";

import { useEffect, useMemo, useState } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import type { EmployeeSummary, Task, TaskStatus } from "@/lib/types";

export default function AdminBoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTasks(data.tasks);
        else setMessage(data.message || "Failed to load tasks");
      })
      .catch(() => setMessage("Something went wrong while loading tasks."))
      .finally(() => setLoading(false));
  }, []);

  const employees = useMemo(() => {
    const map = new Map<string, EmployeeSummary>();
    tasks.forEach((task) => {
      if (task.assignedTo) map.set(task.assignedTo._id, task.assignedTo);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (employeeFilter === "all") return tasks;
    return tasks.filter((task) => task.assignedTo?._id === employeeFilter);
  }, [tasks, employeeFilter]);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const previous = tasks;
    setTasks((current) =>
      current.map((task) => (task._id === taskId ? { ...task, status } : task))
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error();
    } catch {
      setTasks(previous);
      setMessage("Failed to move task. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Task Board</h1>
          <p className="mt-1 text-sm text-ink-500">
            Drag any card between columns, or filter by employee.
          </p>
        </div>

        <select
          value={employeeFilter}
          onChange={(event) => setEmployeeFilter(event.target.value)}
          className="rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">All employees</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-600">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-400">Loading board…</p>
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          basePath="/admin/tasks"
          onStatusChange={handleStatusChange}
          showAssignee
          emptyHint="No tasks here."
        />
      )}
    </div>
  );
}
