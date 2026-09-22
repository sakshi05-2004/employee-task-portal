import type { TaskStatus } from "@/lib/types";

const STYLES: Record<TaskStatus, string> = {
  pending: "bg-danger-50 text-danger-600 ring-1 ring-inset ring-danger-500/20",
  "in-progress":
    "bg-warning-50 text-warning-600 ring-1 ring-inset ring-warning-500/20",
  completed:
    "bg-success-50 text-success-600 ring-1 ring-inset ring-success-500/20",
};

const LABELS: Record<TaskStatus, string> = {
  pending: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
