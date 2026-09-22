"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, initials } from "@/lib/format";

interface Employee {
  _id: string;
  name: string;
  designation?: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
  dueDate?: string;
}

interface Report {
  _id: string;
  task: Task;
  employee: Employee;
  summary: string;
  documentLink?: string;
  submittedAt: string;
  adminComment?: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function loadReports() {
    try {
      const response = await fetch("/api/admin/reports");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load reports");
        setError(true);
        return;
      }

      setReports(data.reports);

      const existingComments: Record<string, string> = {};
      data.reports.forEach((report: Report) => {
        existingComments[report._id] = report.adminComment || "";
      });
      setComments(existingComments);
    } catch {
      setMessage("Something went wrong while loading reports.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function saveComment(reportId: string) {
    const adminComment = comments[reportId]?.trim();

    if (!adminComment) {
      setMessage("Please enter a comment or question.");
      setError(true);
      return;
    }

    setSavingId(reportId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/reports/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, adminComment }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to save comment");
        setError(true);
        return;
      }

      setReports((current) =>
        current.map((report) =>
          report._id === reportId ? { ...report, adminComment } : report
        )
      );

      setMessage("Comment saved successfully.");
      setError(false);
    } catch {
      setMessage("Something went wrong.");
      setError(true);
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Employee Reports</h1>
        <p className="mt-1 text-sm text-ink-500">
          Review submissions and leave feedback for each employee.
        </p>
      </div>

      {message && (
        <p
          className={`rounded-xl px-4 py-2 text-sm ${
            error ? "bg-danger-50 text-danger-600" : "bg-success-50 text-success-600"
          }`}
        >
          {message}
        </p>
      )}

      {loading && <p className="text-sm text-ink-400">Loading reports…</p>}

      {!loading && (
        <div className="flex flex-col gap-5">
          {reports.map((report) => (
            <div
              key={report._id}
              className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {initials(report.employee?.name)}
                  </span>
                  <div>
                    <Link
                      href={`/admin/tasks/${report.task?._id}`}
                      className="font-semibold text-ink-900 hover:text-brand-700"
                    >
                      {report.task?.title || "Task"}
                    </Link>
                    <p className="text-sm text-ink-500">
                      {report.employee?.name || "-"} ·{" "}
                      {report.employee?.designation || "Employee"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      Submitted {formatDate(report.submittedAt)}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    report.task?.status === "completed"
                      ? "bg-success-50 text-success-600"
                      : "bg-warning-50 text-warning-600"
                  }`}
                >
                  {report.task?.status || "unknown"}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-ink-50/60 p-4">
                <p className="text-xs font-semibold text-ink-500">Summary</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                  {report.summary}
                </p>
              </div>

              {report.documentLink && (
                <a
                  href={report.documentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                >
                  🔗 Open Document
                </a>
              )}

              <div className="mt-4 rounded-xl bg-ink-50/60 p-4">
                <p className="text-xs font-semibold text-ink-500">
                  Comment / Question for Employee
                </p>

                <textarea
                  value={comments[report._id] || ""}
                  onChange={(e) =>
                    setComments((current) => ({
                      ...current,
                      [report._id]: e.target.value,
                    }))
                  }
                  placeholder="Write a comment or question…"
                  rows={3}
                  className="mt-2 w-full resize-y rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />

                <button
                  onClick={() => saveComment(report._id)}
                  disabled={savingId === report._id}
                  className="mt-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
                >
                  {savingId === report._id ? "Saving…" : "Save Comment"}
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400 shadow-sm">
              No reports submitted yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
