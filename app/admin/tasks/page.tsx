"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { EmployeeSummary, TaskPriority } from "@/lib/types";

export default function CreateTaskPage() {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await fetch("/api/admin/employees");
        const data = await response.json();

        if (response.ok) {
          setEmployees(data.employees);
        }
      } catch {
        setMessage("Failed to load employees.");
        setError(true);
      }
    }

    loadEmployees();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          assignedTo,
          dueDate: dueDate || undefined,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create task");
        setError(true);
        return;
      }

      setMessage("Task created successfully.");
      setError(false);

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate("");
      setPriority("medium");
    } catch {
      setMessage("Something went wrong.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Create Task</h1>
          <p className="mt-1 text-sm text-ink-500">
            Assign a new task to a member of the team.
          </p>
        </div>
        <Link
          href="/admin/tasks/board"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          View board →
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="text-xs font-medium text-ink-500">
            Task Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
            className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-500">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={4}
            className="mt-1 w-full resize-y rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-ink-500">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Select employee</option>
              {employees
                .filter((employee) => employee.email)
                .map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} — {employee.designation || "Employee"}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-500">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Task"}
        </button>

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-center text-sm ${
              error
                ? "bg-danger-50 text-danger-600"
                : "bg-success-50 text-success-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
