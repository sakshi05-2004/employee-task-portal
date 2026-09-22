"use client";

import { useState } from "react";
import { formatDateTime, initials } from "@/lib/format";
import type { CurrentUser, TaskComment } from "@/lib/types";

export default function CommentThread({
  comments,
  currentUser,
  onAdd,
}: {
  comments: TaskComment[];
  currentUser: CurrentUser | null;
  onAdd: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;

    setPosting(true);
    try {
      await onAdd(message.trim());
      setMessage("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {comments.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-400">
            No comments yet. Share progress notes, feedback or insights
            here.
          </p>
        )}

        {comments.map((comment) => {
          const isMine = comment.sender?._id === currentUser?.id;

          return (
            <div key={comment._id} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  comment.sender?.role === "admin"
                    ? "bg-brand-500 text-white"
                    : "bg-ink-100 text-ink-600"
                }`}
              >
                {initials(comment.sender?.name)}
              </span>

              <div
                className={`flex-1 rounded-2xl px-4 py-3 ${
                  isMine
                    ? "bg-brand-50"
                    : "bg-ink-50"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-sm font-semibold text-ink-800">
                    {comment.sender?.name || "Unknown"}
                    {comment.sender?.role === "admin" && (
                      <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-ink-400">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">
                  {comment.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add a comment, insight or feedback…"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={posting || !message.trim()}
          className="self-end rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}
