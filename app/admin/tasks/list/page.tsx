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
  assignedTo: Employee;
  status: "pending" | "in-progress" | "completed";
  dueDate?: string;
  createdAt: string;
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  function formatDate(date?: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusStyle(status: Task["status"]) {
    if (status === "completed") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "in-progress") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
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
        <h1>Tasks</h1>

        <p style={{ color: "#6b7280" }}>
          View and manage all employee tasks.
        </p>

        {loading && <p>Loading tasks...</p>}

        {message && (
          <p style={{ color: "red" }}>
            {message}
          </p>
        )}

        {!loading && !message && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={cellStyle}>Task</th>
                  <th style={cellStyle}>Employee</th>
                  <th style={cellStyle}>Due Date</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Created</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td style={cellStyle}>
                      <strong>{task.title}</strong>

                      {task.description && (
                        <div
                          style={{
                            marginTop: "6px",
                            color: "#6b7280",
                            fontSize: "14px",
                          }}
                        >
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td style={cellStyle}>
                      {task.assignedTo?.name || "-"}
                    </td>

                    <td style={cellStyle}>
                      {formatDate(task.dueDate)}
                    </td>

                    <td style={cellStyle}>
                      <span
                        style={{
                          ...getStatusStyle(task.status),
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td style={cellStyle}>
                      {formatDate(task.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tasks.length === 0 && (
              <p
                style={{
                  padding: "25px",
                  textAlign: "center",
                }}
              >
                No tasks found.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const cellStyle = {
  padding: "15px",
  textAlign: "left" as const,
  borderBottom: "1px solid #eee",
};