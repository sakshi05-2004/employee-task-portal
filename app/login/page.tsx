"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      if (data.user.mustChangePassword) {
        router.push("/change-password");
      } else if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }

      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50/70 to-background px-4 py-12">
      <Link href="/" className="mb-8">
        <Logo size={44} />
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-lg shadow-ink-900/5">
        <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">
          Sign in to view and manage your tasks.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-ink-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@startupstairs.in"
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              className="mt-1 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {message && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-center text-sm text-danger-600">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          New employees sign in with the default password shared by the
          admin, then choose their own on first login.
        </p>
      </div>
    </main>
  );
}
