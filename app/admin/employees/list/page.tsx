"use client";

import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  name: string;
  designation: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [editName, setEditName] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [resettingId, setResettingId] = useState<string | null>(null);

  async function loadEmployees() {
    try {
      const response = await fetch("/api/admin/employees");

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load employees");
        return;
      }

      setEmployees(data.employees);
    } catch {
      setMessage("Something went wrong while loading employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function startEditing(employee: Employee) {
    setEditingEmployee(employee);
    setEditName(employee.name);
    setEditDesignation(employee.designation || "");
    setEditEmail(employee.email);
    setEditIsActive(employee.isActive);
    setMessage("");
  }

  function cancelEditing() {
    setEditingEmployee(null);
    setEditName("");
    setEditDesignation("");
    setEditEmail("");
    setEditIsActive(true);
  }

  async function handleUpdate() {
    if (!editingEmployee) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/employees", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingEmployee._id,
          name: editName,
          designation: editDesignation,
          email: editEmail,
          isActive: editIsActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update employee");
        return;
      }

      setMessage("Employee updated successfully.");

      cancelEditing();
      await loadEmployees();
    } catch {
      setMessage("Something went wrong while updating employee.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(employee: Employee) {
    const confirmed = window.confirm(
      `Reset the password for ${employee.name}?`
    );

    if (!confirmed) {
      return;
    }

    setResettingId(employee._id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: employee._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to reset password");
        return;
      }

      setMessage(
        `Password reset successfully for ${employee.name}.`
      );
    } catch {
      setMessage("Something went wrong while resetting password.");
    } finally {
      setResettingId(null);
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
        <h1>Employees</h1>

        <p style={{ color: "#6b7280" }}>
          Manage all employees in the portal.
        </p>

        {loading && <p>Loading employees...</p>}

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

        {!loading && (
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
                  <th style={cellStyle}>Name</th>
                  <th style={cellStyle}>Designation</th>
                  <th style={cellStyle}>Email</th>
                  <th style={cellStyle}>Role</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td style={cellStyle}>{employee.name}</td>

                    <td style={cellStyle}>
                      {employee.designation || "-"}
                    </td>

                    <td style={cellStyle}>{employee.email}</td>

                    <td style={cellStyle}>{employee.role}</td>

                    <td style={cellStyle}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </td>

                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => startEditing(employee)}
                          style={{
                            padding: "8px 14px",
                            border: "none",
                            borderRadius: "6px",
                            background: "#111827",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleResetPassword(employee)
                          }
                          disabled={resettingId === employee._id}
                          style={{
                            padding: "8px 14px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            background: "white",
                            color: "#111827",
                            cursor:
                              resettingId === employee._id
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {resettingId === employee._id
                            ? "Resetting..."
                            : "Reset Password"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {employees.length === 0 && (
              <p
                style={{
                  padding: "25px",
                  textAlign: "center",
                }}
              >
                No employees found.
              </p>
            )}
          </div>
        )}

        {editingEmployee && (
          <div
            style={{
              marginTop: "30px",
              background: "white",
              padding: "30px",
              borderRadius: "14px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
            }}
          >
            <h2>Edit Employee</h2>

            <label>Name</label>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={inputStyle}
            />

            <label>Designation</label>

            <input
              type="text"
              value={editDesignation}
              onChange={(e) => setEditDesignation(e.target.value)}
              style={inputStyle}
            />

            <label>Email</label>

            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              style={inputStyle}
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) =>
                  setEditIsActive(e.target.checked)
                }
              />
              Active Employee
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={handleUpdate}
                disabled={saving}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "7px",
                  background: "#111827",
                  color: "white",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={cancelEditing}
                style={{
                  padding: "10px 18px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
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

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "18px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
};