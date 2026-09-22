"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { TaskLink } from "@/lib/types";

export default function LinkList({
  links,
  onAdd,
}: {
  links: TaskLink[];
  onAdd: (label: string, url: string) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!url.trim()) {
      setError("Paste a link to share.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onAdd(label.trim(), url.trim());
      setLabel("");
      setUrl("");
    } catch {
      setError("Failed to share that link.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {links.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 px-4 py-5 text-center text-sm text-ink-400">
          No documents shared yet. Paste a Google Drive, OneDrive or
          SharePoint link below.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-100">
          {links.map((link) => (
            <li
              key={link._id}
              className="flex items-center justify-between gap-3 bg-white px-4 py-3"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm font-medium text-brand-700 hover:underline"
              >
                <span aria-hidden>🔗</span>
                <span className="truncate">{link.label}</span>
              </a>
              <span className="shrink-0 text-xs text-ink-400">
                {formatDate(link.addedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Label (optional)"
          className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-40"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste document link (Drive, OneDrive, SharePoint…)"
          className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-40"
        >
          {saving ? "Sharing…" : "Share Link"}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-danger-600">{error}</p>}
    </div>
  );
}
