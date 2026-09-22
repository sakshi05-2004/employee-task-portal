"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "pending", label: "To Do", accent: "bg-danger-500" },
  { status: "in-progress", label: "In Progress", accent: "bg-warning-500" },
  { status: "completed", label: "Completed", accent: "bg-success-500" },
];

export default function KanbanBoard({
  tasks,
  basePath,
  onStatusChange,
  showAssignee = false,
  canMoveStatus = () => true,
  emptyHint = "No tasks here yet.",
}: {
  tasks: Task[];
  basePath: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void | Promise<void>;
  showAssignee?: boolean;
  canMoveStatus?: (task: Task) => boolean;
  emptyHint?: string;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(
    null
  );

  function handleDrop(status: TaskStatus) {
    setDragOverColumn(null);

    if (!draggedId) return;

    const task = tasks.find((item) => item._id === draggedId);

    if (task && task.status !== status && canMoveStatus(task)) {
      onStatusChange(draggedId, status);
    }

    setDraggedId(null);
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.status
        );

        return (
          <div
            key={column.status}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverColumn(column.status);
            }}
            onDragLeave={() =>
              setDragOverColumn((current) =>
                current === column.status ? null : current
              )
            }
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(column.status);
            }}
            className={`flex flex-col rounded-2xl border border-ink-100 bg-ink-50/40 p-3 transition ${
              dragOverColumn === column.status ? "kanban-drop-active" : ""
            }`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${column.accent}`} />
                <h2 className="text-sm font-semibold text-ink-700">
                  {column.label}
                </h2>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink-400 ring-1 ring-ink-100">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex min-h-[120px] flex-col gap-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  href={`${basePath}/${task._id}`}
                  showAssignee={showAssignee}
                  draggable={canMoveStatus(task)}
                  canMoveStatus={canMoveStatus(task)}
                  onDragStart={(event, id) => {
                    setDraggedId(id);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggedId(null)}
                  onMove={(id, status) => onStatusChange(id, status)}
                />
              ))}

              {columnTasks.length === 0 && (
                <p className="rounded-xl border border-dashed border-ink-200 px-3 py-6 text-center text-xs text-ink-300">
                  {emptyHint}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
