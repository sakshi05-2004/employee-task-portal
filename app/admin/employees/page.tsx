"use client";

import { FormEvent, useState } from "react";

export default function AddEmployeePage() {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          designation,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create employee");
        return;
      }

      setMessage(
        "Employee created successfully. Default password has been assigned."
      );

      setName("");
      setDesignation("");
      setEmail("");
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
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h1>Add Employee</h1>

        <p style={{ color: "#6b7280" }}>
          Create a new employee account.
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
          <label>Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter employee name"
            required
            style={inputStyle}
          />

          <label>Designation</label>

          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Enter designation"
            required
            style={inputStyle}
          />

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter employee email"
            required
            style={inputStyle}
          />

          <p
            style={{
              marginTop: "0",
              marginBottom: "18px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            A default password will be automatically assigned to the employee.
          </p>

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
            {loading ? "Creating..." : "Create Employee"}
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