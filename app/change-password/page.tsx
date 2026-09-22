"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import type { CurrentUser } from "@/lib/types";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update password");
        return;
      }

      setMessage("Password updated. Redirecting…");

      setTimeout(() => {
        router.push(user?.role === "admin" ? "/admin" : "/employee");
        router.refresh();
      }, 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const forced = user?.mustChangePassword;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50/70 to-background px-4 py-12">
      <Logo size={44} className="mb-8" />

      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-lg shadow-ink-900/5">
        <h1 className="text-2xl font-bold text-ink-900">
          {forced ? "Set a new password" : "Change your password"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {forced
            ? "You're signed in with a default password. Choose your own before continuing."
            : "Update the password you use to sign in."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-ink-500">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-ink-400">At least 8 characters.</p>
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>

          {message && (
            <p className="rounded-lg bg-success-50 px-3 py-2 text-center text-sm text-success-600">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-center text-sm text-danger-600">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
