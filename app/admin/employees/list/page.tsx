"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { initials } from "@/lib/format";

interface Employee {
  _id: string;
  name: string;
  designation?: string;
  email: string;
  role: "admin" | "employee";
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
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
        setError(true);
        return;
      }

      setEmployees(data.employees);
    } catch {
      setMessage("Something went wrong while loading employees.");
      setError(true);
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
  }

  async function saveEmployee() {
    if (!editingEmployee) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        setError(true);
        return;
      }

      setMessage("Employee updated successfully.");
      setError(false);

      setEmployees((current) =>
        current.map((employee) =>
          employee._id === editingEmployee._id ? data.employee : employee
        )
      );

      closeEdit();
    } catch {
      setMessage("Something went wrong.");
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword(employee: Employee) {
    const confirmed = window.confirm(`Reset password for ${employee.name}?`);
    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: employee._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to reset password");
        setError(true);
        return;
      }

      setMessage(
        `Password reset for ${employee.name}. Default password: ${data.defaultPassword} — they'll be asked to change it on next login.`
      );
      setError(false);
    } catch {
      setMessage("Something went wrong.");
      setError(true);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Employees</h1>
          <p className="mt-1 text-sm text-ink-500">
            View and manage employee accounts.
          </p>
        </div>
        <Link
          href="/admin/employees"
          className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
        >
          + Add Employee
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, designation or email…"
          className="min-w-[240px] flex-1 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        >
          <option value="all">All Employees</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading && <p className="text-sm text-ink-400">Loading employees…</p>}

      {message && (
        <p
          className={`rounded-xl px-4 py-2 text-sm ${
            error ? "bg-danger-50 text-danger-600" : "bg-success-50 text-success-600"
          }`}
        >
          {message}
        </p>
      )}

      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Designation</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink-50">
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {initials(employee.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-ink-900">
                            {employee.name}
                          </p>
                          {employee.mustChangePassword && (
                            <p className="text-xs text-warning-600">
                              Default password active
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-ink-600">
                      {employee.designation || "-"}
                    </td>

                    <td className="px-5 py-4 text-ink-600">{employee.email}</td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          employee.isActive
                            ? "bg-success-50 text-success-600"
                            : "bg-danger-50 text-danger-600"
                        }`}
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEdit(employee)}
                          className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => resetPassword(employee)}
                          className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-400">
              No employees found.
            </p>
          )}
        </div>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-ink-900">Edit Employee</h2>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-ink-500">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-500">
                  Designation
                </label>
                <input
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-500">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                />
                Active employee
              </label>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={saveEmployee}
                  disabled={saving}
                  className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={closeEdit}
                  className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
