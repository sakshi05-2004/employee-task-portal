"use client";

import { FormEvent, useEffect, useState } from "react";
import KanbanBoard from "@/components/KanbanBoard";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [creating, setCreating] = useState(false);

  async function loadTasks() {
    try {
      const response = await fetch("/api/employee/tasks");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load tasks");
        setError(true);
        return;
      }

      setTasks(data.tasks);
    } catch {
      setMessage("Something went wrong while loading tasks.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const previous = tasks;
    setTasks((current) =>
      current.map((task) => (task._id === taskId ? { ...task, status } : task))
    );

    try {
      const response = await fetch("/api/employee/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });

      if (!response.ok) throw new Error();
      setMessage("Task status updated.");
      setError(false);
    } catch {
      setTasks(previous);
      setMessage("Failed to update task status.");
      setError(true);
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setMessage("");

    try {
      const response = await fetch("/api/employee/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
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

      setTasks((current) => [data.task, ...current]);
      setMessage("Task added to your board.");
      setError(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      setShowForm(false);
    } catch {
      setMessage("Something went wrong.");
      setError(true);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My Board</h1>
          <p className="mt-1 text-sm text-ink-500">
            Drag your tasks across stages, or allot a new one to yourself.
          </p>
        </div>

        <button
          onClick={() => setShowForm((open) => !open)}
          className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
        >
          {showForm ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold text-ink-800">
            Allot a task to yourself
          </p>

          <div>
            <label className="text-xs font-medium text-ink-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What do you need to do?"
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
              rows={3}
              className="mt-1 w-full resize-y rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-ink-500">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
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

          <button
            type="submit"
            disabled={creating}
            className="self-start rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {creating ? "Adding…" : "Add to my board"}
          </button>
        </form>
      )}

      {message && (
        <p
          className={`rounded-xl px-4 py-2 text-sm ${
            error ? "bg-danger-50 text-danger-600" : "bg-success-50 text-success-600"
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-400">Loading your tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400 shadow-sm">
          No tasks have been assigned to you yet. Add one with “New Task”.
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          basePath="/employee/tasks"
          onStatusChange={handleStatusChange}
          emptyHint="Nothing here."
        />
      )}
    </div>
  );
}
