"use client";

import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  name: string;
  designation?: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
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

  async function loadReports() {
    try {
      const response = await fetch("/api/admin/reports");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load reports");
        return;
      }

      setReports(data.reports);

      const existingComments: Record<string, string> = {};

      data.reports.forEach((report: Report) => {
        existingComments[report._id] =
          report.adminComment || "";
      });

      setComments(existingComments);
    } catch {
      setMessage("Something went wrong while loading reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function formatDate(date?: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function saveComment(reportId: string) {
    const adminComment = comments[reportId]?.trim();

    if (!adminComment) {
      setMessage("Please enter a comment or question.");
      return;
    }

    setSavingId(reportId);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/reports/comments",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportId,
            adminComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to save comment"
        );
        return;
      }

      setReports((currentReports) =>
        currentReports.map((report) =>
          report._id === reportId
            ? {
                ...report,
                adminComment,
              }
            : report
        )
      );

      setMessage("Comment saved successfully.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1>Employee Reports</h1>

        <p style={{ color: "#6b7280" }}>
          View reports submitted by employees.
        </p>

        {message && (
          <p
            style={{
              color: message.includes("successfully")
                ? "green"
                : "red",
            }}
          >
            {message}
          </p>
        )}

        {loading && <p>Loading reports...</p>}

        {!loading && (
          <div
            style={{
              display: "grid",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            {reports.map((report) => (
              <div
                key={report._id}
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "14px",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2 style={{ marginTop: 0 }}>
                      {report.task?.title || "Task"}
                    </h2>

                    <p>
                      <strong>Employee:</strong>{" "}
                      {report.employee?.name || "-"}
                    </p>

                    <p>
                      <strong>Designation:</strong>{" "}
                      {report.employee?.designation || "-"}
                    </p>

                    <p>
                      <strong>Submitted:</strong>{" "}
                      {formatDate(report.submittedAt)}
                    </p>
                  </div>

                  <div>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background:
                          report.task?.status === "completed"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          report.task?.status === "completed"
                            ? "#166534"
                            : "#92400e",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {report.task?.status || "unknown"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    background: "#f9fafb",
                    borderRadius: "10px",
                  }}
                >
                  <strong>Summary</strong>

                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                    }}
                  >
                    {report.summary}
                  </p>
                </div>

                {report.documentLink && (
                  <div style={{ marginTop: "18px" }}>
                    <a
                      href={report.documentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      Open Document
                    </a>
                  </div>
                )}

                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    background: "#f9fafb",
                    borderRadius: "10px",
                  }}
                >
                  <strong>
                    Comment / Question for Employee
                  </strong>

                  <textarea
                    value={comments[report._id] || ""}
                    onChange={(e) =>
                      setComments((current) => ({
                        ...current,
                        [report._id]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment or question..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "10px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />

                  <button
                    onClick={() => saveComment(report._id)}
                    disabled={savingId === report._id}
                    style={{
                      marginTop: "10px",
                      padding: "10px 18px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#111827",
                      color: "white",
                      cursor:
                        savingId === report._id
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {savingId === report._id
                      ? "Saving..."
                      : "Save Comment"}
                  </button>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div
                style={{
                  background: "white",
                  padding: "30px",
                  borderRadius: "14px",
                  textAlign: "center",
                }}
              >
                No reports submitted yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}