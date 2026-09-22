"use client";

import { useEffect, useState } from "react";

interface Employee {
  _id: string;
  name: string;
  designation?: string;
  email: string;
  role: "admin" | "employee";
  isActive: boolean;
  createdAt: string;
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [editName, setEditName] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    const searchText = search.toLowerCase().trim();

    const filtered = employees.filter((employee) => {
      const matchesSearch =
        !searchText ||
        employee.name.toLowerCase().includes(searchText) ||
        (employee.designation || "").toLowerCase().includes(searchText) ||
        employee.email.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && employee.isActive) ||
        (statusFilter === "inactive" && !employee.isActive);

      return matchesSearch && matchesStatus;
    });

    setFilteredEmployees(filtered);
  }, [employees, search, statusFilter]);

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);
    setEditName(employee.name);
    setEditDesignation(employee.designation || "");
    setEditEmail(employee.email);
    setEditIsActive(employee.isActive);
    setMessage("");
  }

  function closeEdit() {
    setEditingEmployee(null);
    setEditName("");
    setEditDesignation("");
    setEditEmail("");
    setEditIsActive(true);
  }

  async function saveEmployee() {
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

      setEmployees((currentEmployees) =>
        currentEmployees.map((employee) =>
          employee._id === editingEmployee._id
            ? data.employee
            : employee
        )
      );

      closeEdit();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword(employee: Employee) {
    const confirmed = window.confirm(
      `Reset password for ${employee.name}?`
    );

    if (!confirmed) return;

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
      setMessage("Something went wrong.");
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
          View and manage employee accounts.
        </p>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "14px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
            marginTop: "25px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, designation or email..."
            style={{
              flex: 1,
              minWidth: "280px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          >
            <option value="all">All Employees</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

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
              marginTop: "20px",
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
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td style={cellStyle}>
                      {employee.name}
                    </td>

                    <td style={cellStyle}>
                      {employee.designation || "-"}
                    </td>

                    <td style={cellStyle}>
                      {employee.email}
                    </td>

                    <td style={cellStyle}>
                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: "999px",
                          background: employee.isActive
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: employee.isActive
                            ? "#166534"
                            : "#991b1b",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {employee.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
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
                          onClick={() => openEdit(employee)}
                          style={actionButtonStyle}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            resetPassword(employee)
                          }
                          style={actionButtonStyle}
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEmployees.length === 0 && (
              <p
                style={{
                  padding: "25px",
                  textAlign: "center",
                  color: "#6b7280",
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
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "white",
                width: "100%",
                maxWidth: "550px",
                padding: "30px",
                borderRadius: "14px",
              }}
            >
              <h2>Edit Employee</h2>

              <label>Name</label>

              <input
                value={editName}
                onChange={(e) =>
                  setEditName(e.target.value)
                }
                style={inputStyle}
              />

              <label>Designation</label>

              <input
                value={editDesignation}
                onChange={(e) =>
                  setEditDesignation(e.target.value)
                }
                style={inputStyle}
              />

              <label>Email</label>

              <input
                type="email"
                value={editEmail}
                onChange={(e) =>
                  setEditEmail(e.target.value)
                }
                style={inputStyle}
              />

              <label
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
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
                  onClick={saveEmployee}
                  disabled={saving}
                  style={primaryButtonStyle}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={closeEdit}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              </div>
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

const actionButtonStyle = {
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "white",
  cursor: "pointer",
};

const primaryButtonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "8px",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "white",
  cursor: "pointer",
};