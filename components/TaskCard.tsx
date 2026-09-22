"use client";

import { useRouter } from "next/navigation";
import PriorityBadge from "./PriorityBadge";
import { formatDate, initials, isOverdue } from "@/lib/format";
import type { Task, TaskStatus } from "@/lib/types";

const ORDER: TaskStatus[] = ["pending", "in-progress", "completed"];

export default function TaskCard({
  task,
  href,
  showAssignee = false,
  draggable = true,
  canMoveStatus = true,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  task: Task;
  href: string;
  showAssignee?: boolean;
  draggable?: boolean;
  canMoveStatus?: boolean;
  onDragStart?: (event: React.DragEvent, taskId: string) => void;
  onDragEnd?: (event: React.DragEvent) => void;
  onMove?: (taskId: string, status: TaskStatus) => void;
}) {
  const router = useRouter();
  const overdue = isOverdue(task.dueDate, task.status);
  const currentIndex = ORDER.indexOf(task.status);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={(event) => onDragStart?.(event, task._id)}
      onDragEnd={onDragEnd}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter") router.push(href);
      }}
      className="group cursor-pointer rounded-xl border border-ink-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-900 line-clamp-2 group-hover:text-brand-700">
          {task.title}
        </h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-ink-400">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-400">
        <span
          className={`inline-flex items-center gap-1 font-medium ${
            overdue ? "text-danger-600" : ""
          }`}
        >
          {overdue ? "Overdue:" : "Due:"} {formatDate(task.dueDate)}
        </span>

        {task.links.length > 0 && (
          <span className="inline-flex items-center gap-1">
            🔗 {task.links.length}
          </span>
        )}
      </div>

      {(showAssignee || (canMoveStatus && onMove)) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-50 pt-3">
          {showAssignee ? (
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                {initials(task.assignedTo?.name)}
              </span>
              <span className="text-xs font-medium text-ink-500">
                {task.assignedTo?.name || "Unassigned"}
              </span>
            </div>
          ) : (
            <span />
          )}

          {canMoveStatus && onMove && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentIndex <= 0}
                onClick={(event) => {
                  event.stopPropagation();
                  onMove(task._id, ORDER[currentIndex - 1]);
                }}
                className="rounded-md px-1.5 py-1 text-xs text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-0"
                title="Move back"
                aria-label="Move to previous column"
              >
                ←
              </button>
              <button
                type="button"
                disabled={currentIndex >= ORDER.length - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  onMove(task._id, ORDER[currentIndex + 1]);
                }}
                className="rounded-md px-1.5 py-1 text-xs text-ink-400 hover:bg-ink-50 hover:text-ink-700 disabled:opacity-0"
                title="Move forward"
                aria-label="Move to next column"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
