"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <nav
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/admin" style={navLinkStyle}>
            Dashboard
          </Link>

          <Link
            href="/admin/employees"
            style={navLinkStyle}
          >
            Add Employee
          </Link>

          <Link
            href="/admin/employees/list"
            style={navLinkStyle}
          >
            Employees
          </Link>

          <Link
            href="/admin/tasks"
            style={navLinkStyle}
          >
            Create Task
          </Link>

          <Link
            href="/admin/tasks/list"
            style={navLinkStyle}
          >
            Tasks
          </Link>

          <Link
            href="/admin/reports"
            style={navLinkStyle}
          >
            Reports
          </Link>
        </nav>

        <h1>Admin Dashboard</h1>

        <p style={{ color: "#6b7280" }}>
          Manage employees, tasks and reports.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <DashboardCard
            title="Employees"
            description="Add and manage employees"
            href="/admin/employees/list"
          />

          <DashboardCard
            title="Tasks"
            description="Create and view employee tasks"
            href="/admin/tasks/list"
          />

          <DashboardCard
            title="Reports"
            description="Review employee reports"
            href="/admin/reports"
          />

          <DashboardCard
            title="Add Employee"
            description="Create a new employee account"
            href="/admin/employees"
          />

          <DashboardCard
            title="Create Task"
            description="Assign a new task"
            href="/admin/tasks"
          />
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "14px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
        textDecoration: "none",
        color: "#111827",
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>

      <p style={{ color: "#6b7280" }}>
        {description}
      </p>

      <span
        style={{
          color: "#2563eb",
          fontWeight: 600,
        }}
      >
        Open →
      </span>
    </Link>
  );
}

const navLinkStyle = {
  textDecoration: "none",
  color: "#111827",
  background: "white",
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontWeight: 600,
};