"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AddEmployeePage() {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [defaultPassword, setDefaultPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setDefaultPassword("");

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
        setError(true);
        return;
      }

      setMessage(`${name.trim()} was created successfully.`);
      setError(false);
      setDefaultPassword(data.defaultPassword);

      setName("");
      setDesignation("");
      setEmail("");
    } catch {
      setMessage("Something went wrong.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Add Employee</h1>
          <p className="mt-1 text-sm text-ink-500">
            Create a new employee account for the portal.
          </p>
        </div>
        <Link
          href="/admin/employees/list"
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          View all →
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="text-xs font-medium text-ink-500">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter employee name"
            required
            className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-500">
            Designation
          </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Enter designation"
            required
            className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter employee email"
            required
            className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <p className="text-xs text-ink-400">
          A default password is assigned automatically. The employee must
          change it the first time they sign in.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Employee"}
        </button>

        {message && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              error
                ? "bg-danger-50 text-danger-600"
                : "bg-success-50 text-success-600"
            }`}
          >
            <p className="text-center">{message}</p>
            {defaultPassword && (
              <p className="mt-1.5 text-center">
                Default password:{" "}
                <code className="rounded bg-white px-2 py-0.5 font-mono text-xs text-ink-800 ring-1 ring-success-500/30">
                  {defaultPassword}
                </code>
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
