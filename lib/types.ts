export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type Role = "admin" | "employee";

export interface EmployeeSummary {
  _id: string;
  name: string;
  designation?: string;
  email: string;
  role?: Role;
}

export interface TaskLink {
  _id: string;
  label: string;
  url: string;
  addedBy: EmployeeSummary | string;
  addedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  assignedTo: EmployeeSummary;
  // Optional because tasks created before self-assignment shipped may
  // not have this field backfilled yet.
  createdBy?: EmployeeSummary;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  links: TaskLink[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  _id: string;
  task: string;
  sender: EmployeeSummary;
  message: string;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
}
