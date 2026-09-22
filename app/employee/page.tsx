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

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const employeeId = "6ab222a17485c460504d239e";

  async function loadTasks() {
    try {
      const response = await fetch(
        `/api/employee/tasks?employeeId=${employeeId}`
      );

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

  async function updateStatus(
    taskId: string,
    status: Task["status"]
  ) {
    try {
      const response = await fetch("/api/employee/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update status");
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId
            ? { ...task, status }
            : task
        )
      );
    } catch {
      setMessage("Something went wrong.");
    }
  }

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
        <h1>Employee Dashboard</h1>

        <p style={{ color: "#6b7280" }}>
          View your assigned tasks and update their status.
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
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            {tasks.map((task) => (
              <div
                key={task._id}
                style={{
                  background: "white",
                  padding: "22px",
                  borderRadius: "14px",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.05)",
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                    fontSize: "20px",
                  }}
                >
                  {task.title}
                </h2>

                {task.description && (
                  <p
                    style={{
                      color: "#6b7280",
                      lineHeight: 1.5,
                    }}
                  >
                    {task.description}
                  </p>
                )}

                <p>
                  <strong>Due Date:</strong>{" "}
                  {formatDate(task.dueDate)}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      ...getStatusStyle(task.status),
                      padding: "5px 9px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {task.status}
                  </span>
                </p>

                <label>
                  Update Status
                </label>

                <select
                  value={task.status}
                  onChange={(e) =>
                    updateStatus(
                      task._id,
                      e.target.value as Task["status"]
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginTop: "8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="in-progress">
                    In Progress
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>
            ))}

            {tasks.length === 0 && (
              <p>No tasks assigned to you.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}