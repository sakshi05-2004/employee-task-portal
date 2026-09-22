"use client";

import { FormEvent, useEffect, useState } from "react";

interface Employee {
  _id: string;
  name: string;
  designation: string;
  email: string;
}

export default function CreateTaskPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create task");
        return;
      }

      setMessage("Task created successfully.");

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate("");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
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
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <h1>Create Task</h1>

        <p style={{ color: "#6b7280" }}>
          Create and assign a task to an employee.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <label>Task Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
            style={inputStyle}
          />

          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={5}
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />

          <label>Assign To</label>

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
            style={inputStyle}
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

          <label>Due Date</label>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>

          {message && (
            <p
              style={{
                marginTop: "15px",
                color: message.includes("successfully")
                  ? "green"
                  : "red",
              }}
            >
              {message}
            </p>
          )}
        </form>
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