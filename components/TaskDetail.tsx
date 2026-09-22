"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import CommentThread from "./CommentThread";
import LinkList from "./LinkList";
import { formatDateTime } from "@/lib/format";
import type {
  CurrentUser,
  EmployeeSummary,
  Task,
  TaskComment,
  TaskStatus,
  TaskPriority,
} from "@/lib/types";

const STATUS_STEPS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function TaskDetail({
  taskId,
  backHref,
}: {
  taskId: string;
  backHref: string;
}) {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium" as TaskPriority,
    assignedTo: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meRes, taskRes, commentsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/tasks/${taskId}`),
          fetch(`/api/tasks/${taskId}/comments`),
        ]);

        const me = await meRes.json();
        const taskData = await taskRes.json();
        const commentsData = await commentsRes.json();

        if (cancelled) return;

        if (me.success) setCurrentUser(me.user);

        if (!taskRes.ok) {
          setError(taskData.message || "Failed to load task.");
          return;
        }

        setTask(taskData.task);
        setForm({
          title: taskData.task.title,
          description: taskData.task.description || "",
          dueDate: taskData.task.dueDate
            ? taskData.task.dueDate.slice(0, 10)
            : "",
          priority: taskData.task.priority,
          assignedTo: taskData.task.assignedTo?._id || "",
        });

        if (commentsRes.ok) setComments(commentsData.comments);

        if (me.success && me.user.role === "admin") {
          const employeesRes = await fetch("/api/admin/employees");
          const employeesData = await employeesRes.json();
          if (!cancelled && employeesRes.ok) {
            setEmployees(employeesData.employees);
          }
        }
      } catch {
        if (!cancelled) setError("Something went wrong while loading this task.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  if (loading) {
    return <p className="text-sm text-ink-400">Loading task…</p>;
  }

  if (error || !task) {
    return (
      <div className="rounded-2xl border border-danger-500/20 bg-danger-50 px-5 py-4 text-sm text-danger-600">
        {error || "Task not found."}
      </div>
    );
  }

  const isAdmin = currentUser?.role === "admin";
  const isAssignee = currentUser?.id === task.assignedTo?._id;
  const isCreator = currentUser?.id === task.createdBy?._id;
  const canEditDetails = isAdmin || isCreator;
  const canChangeStatus = isAdmin || isAssignee;

  async function updateTask(payload: Record<string, unknown>) {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update task");
    }

    setTask(data.task);
    return data.task as Task;
  }

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    setNotice("");
    try {
      await updateTask({ status });
      setNotice("Status updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  }

  async function handleSaveDetails(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      await updateTask({
        title: form.title,
        description: form.description,
        dueDate: form.dueDate || null,
        priority: form.priority,
        ...(isAdmin ? { assignedTo: form.assignedTo } : {}),
      });
      setEditing(false);
      setNotice("Task details saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete task");
        setDeleting(false);
        return;
      }

      router.push(backHref);
    } catch {
      setError("Something went wrong while deleting.");
      setDeleting(false);
    }
  }

  async function handleAddComment(message: string) {
    const response = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    setComments((current) => [...current, data.comment]);
  }

  async function handleAddLink(label: string, url: string) {
    const response = await fetch(`/api/tasks/${taskId}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, url }),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    setTask((current) => (current ? { ...current, links: data.links } : current));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-ink-400 hover:text-brand-700"
        >
          ← Back
        </Link>
      </div>

      {notice && (
        <p className="rounded-xl bg-success-50 px-4 py-2 text-sm text-success-600">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-danger-50 px-4 py-2 text-sm text-danger-600">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {!editing ? (
              <h1 className="text-xl font-bold text-ink-900">{task.title}</h1>
            ) : (
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((f) => ({ ...f, title: event.target.value }))
                }
                className="w-full rounded-lg border border-ink-200 px-3 py-2 text-lg font-bold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            )}
            <p className="mt-1 text-xs text-ink-400">
              Created by {task.createdBy?.name || "—"} on{" "}
              {formatDateTime(task.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            {canEditDetails && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
              >
                Edit
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-danger-500/30 px-3 py-1.5 text-xs font-semibold text-danger-600 hover:bg-danger-50 disabled:opacity-40"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        </div>

        {!editing ? (
          <>
            <p className="mt-4 whitespace-pre-wrap text-sm text-ink-600">
              {task.description || "No description provided."}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-50 pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-xs font-medium text-ink-400">Assigned to</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-800">
                  {task.assignedTo?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-400">Priority</dt>
                <dd className="mt-0.5 text-sm font-semibold capitalize text-ink-800">
                  {task.priority}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-400">Due date</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-800">
                  {formatDateTime(task.dueDate).split(",").slice(0, 2).join(",")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-ink-400">Last updated</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-800">
                  {formatDateTime(task.updatedAt)}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <form
            onSubmit={handleSaveDetails}
            className="mt-4 flex flex-col gap-3 border-t border-ink-50 pt-4"
          >
            <div>
              <label className="text-xs font-medium text-ink-500">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((f) => ({ ...f, description: event.target.value }))
                }
                rows={4}
                className="mt-1 w-full resize-y rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-ink-500">
                  Due date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, dueDate: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-500">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((f) => ({
                      ...f,
                      priority: event.target.value as TaskPriority,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-xs font-medium text-ink-500">
                    Assigned to
                  </label>
                  <select
                    value={form.assignedTo}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, assignedTo: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  >
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 border-t border-ink-50 pt-5">
          <p className="mb-2 text-xs font-medium text-ink-500">Status</p>
          <div className="inline-flex rounded-xl border border-ink-200 p-1">
            {STATUS_STEPS.map((step) => (
              <button
                key={step.value}
                type="button"
                disabled={!canChangeStatus || task.status === step.value}
                onClick={() => handleStatusChange(step.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  task.status === step.value
                    ? "bg-brand-600 text-white"
                    : "text-ink-500 hover:bg-ink-50"
                } disabled:cursor-not-allowed disabled:hover:bg-transparent`}
              >
                {step.label}
              </button>
            ))}
          </div>
          {!canChangeStatus && (
            <p className="mt-2 text-xs text-ink-400">
              Only the assigned employee or an admin can change status.
            </p>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-ink-800">
          Shared Documents &amp; Links
        </h2>
        <div className="mt-3">
          <LinkList links={task.links} onAdd={handleAddLink} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-ink-800">
          Comments &amp; Insights
        </h2>
        <div className="mt-3">
          <CommentThread
            comments={comments}
            currentUser={currentUser}
            onAdd={handleAddComment}
          />
        </div>
      </section>
    </div>
  );
}
