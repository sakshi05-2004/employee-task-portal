"use client";

import { FormEvent, useEffect, useState } from "react";

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
  const employeeId = "6ab222a17485c460504d239e";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [summary, setSummary] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      const [tasksResponse, reportsResponse] = await Promise.all([
        fetch(
          `/api/employee/tasks?employeeId=${employeeId}`
        ),
        fetch(
          `/api/employee/reports?employeeId=${employeeId}`
        ),
      ]);

      const tasksData = await tasksResponse.json();
      const reportsData = await reportsResponse.json();

      if (tasksResponse.ok) {
        setTasks(tasksData.tasks);
      }

      if (reportsResponse.ok) {
        setReports(reportsData.reports);
      }
    } catch {
      setMessage("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/employee/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task: selectedTask,
            employee: employeeId,
            summary,
            documentLink,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to submit report"
        );
        return;
      }

      setMessage("Report submitted successfully.");

      setSelectedTask("");
      setSummary("");
      setDocumentLink("");

      await loadData();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h1>Reports</h1>

        <p style={{ color: "#6b7280" }}>
          Submit your task summary and external document link.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "14px",
                boxShadow:
                  "0 5px 20px rgba(0,0,0,0.05)",
                marginTop: "25px",
              }}
            >
              <label>Task</label>

              <select
                value={selectedTask}
                onChange={(e) =>
                  setSelectedTask(e.target.value)
                }
                required
                style={inputStyle}
              >
                <option value="">
                  Select task
                </option>

                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>

              <label>Summary</label>

              <textarea
                value={summary}
                onChange={(e) =>
                  setSummary(e.target.value)
                }
                placeholder="Enter your task summary"
                rows={6}
                required
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />

              <label>
                Document Link
              </label>

              <input
                type="url"
                value={documentLink}
                onChange={(e) =>
                  setDocumentLink(e.target.value)
                }
                placeholder="Paste Google Drive / OneDrive / SharePoint link"
                style={inputStyle}
              />

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Paste the external document link. No file
                upload is required.
              </p>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#111827",
                  color: "white",
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "16px",
                }}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Report"}
              </button>

              {message && (
                <p
                  style={{
                    marginTop: "15px",
                    color: message.includes(
                      "successfully"
                    )
                      ? "green"
                      : "red",
                  }}
                >
                  {message}
                </p>
              )}
            </form>

            <h2 style={{ marginTop: "40px" }}>
              Submitted Reports
            </h2>

            {reports.length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                No reports submitted yet.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "15px",
                  marginTop: "20px",
                }}
              >
                {reports.map((report) => (
                  <div
                    key={report._id}
                    style={{
                      background: "white",
                      padding: "22px",
                      borderRadius: "14px",
                      boxShadow:
                        "0 5px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3>{report.task?.title}</h3>

                    <p>{report.summary}</p>

                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      Submitted:{" "}
                      {formatDate(report.submittedAt)}
                    </p>

                    {report.documentLink && (
                      <a
                        href={report.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Document
                      </a>
                    )}

                    {report.adminComment && (
                      <div
                        style={{
                          marginTop: "15px",
                          padding: "12px",
                          background: "#f3f4f6",
                          borderRadius: "8px",
                        }}
                      >
                        <strong>
                          Admin Comment:
                        </strong>

                        <p>
                          {report.adminComment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "18px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
};