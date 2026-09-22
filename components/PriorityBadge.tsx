import type { TaskPriority } from "@/lib/types";

const STYLES: Record<TaskPriority, string> = {
  high: "bg-danger-50 text-danger-600",
  medium: "bg-warning-50 text-warning-600",
  low: "bg-info-50 text-info-600",
};

const LABELS: Record<TaskPriority, string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export default function PriorityBadge({
  priority,
}: {
  priority: TaskPriority;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[priority]}`}
      title={LABELS[priority]}
    >
      {priority[0].toUpperCase() + priority.slice(1)}
    </span>
  );
}
