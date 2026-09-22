"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

interface Task {
  _id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
}

interface Report {
  _id: string;
  task: Task;
  summary: string;
  documentLink?: string;
  submittedAt: string;
  adminComment?: string;
}

export default function EmployeeReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [summary, setSummary] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [tasksResponse, reportsResponse] = await Promise.all([
        fetch("/api/employee/tasks"),
        fetch("/api/employee/reports"),
      ]);

      const tasksData = await tasksResponse.json();
      const reportsData = await reportsResponse.json();

      if (tasksResponse.ok) setTasks(tasksData.tasks);
      if (reportsResponse.ok) setReports(reportsData.reports);
    } catch {
      setMessage("Failed to load data.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/employee/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: selectedTask,
          summary,
          documentLink,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to submit report");
        setError(true);
        return;
      }

      setMessage("Report submitted successfully.");
      setError(false);

      setSelectedTask("");
      setSummary("");
      setDocumentLink("");

      await loadData();
    } catch {
      setMessage("Something went wrong.");
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Reports</h1>
        <p className="mt-1 text-sm text-ink-500">
          Submit a task summary and share an external document link.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="text-xs font-medium text-ink-500">Task</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">Select task</option>
                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500">
                Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Enter your task summary"
                rows={5}
                required
                className="mt-1 w-full resize-y rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-500">
                Document Link
              </label>
              <input
                type="url"
                value={documentLink}
                onChange={(e) => setDocumentLink(e.target.value)}
                placeholder="Paste Google Drive / OneDrive / SharePoint link"
                className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <p className="mt-1 text-xs text-ink-400">
                Paste the external document link — no file upload required.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Report"}
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

          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink-800">
              Submitted Reports
            </h2>

            {reports.length === 0 ? (
              <p className="text-sm text-ink-400">No reports submitted yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-semibold text-ink-900">
                      {report.task?.title}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink-600">
                      {report.summary}
                    </p>
                    <p className="mt-2 text-xs text-ink-400">
                      Submitted: {formatDate(report.submittedAt)}
                    </p>

                    {report.documentLink && (
                      <a
                        href={report.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                      >
                        🔗 Open Document
                      </a>
                    )}

                    {report.adminComment && (
                      <div className="mt-3 rounded-xl bg-brand-50 p-3">
                        <p className="text-xs font-semibold text-brand-700">
                          Admin Comment
                        </p>
                        <p className="mt-1 text-sm text-ink-700">
                          {report.adminComment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
