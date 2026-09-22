"use client";

export default function AdminDashboard() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            background: "#111827",
            color: "white",
            padding: "24px 28px",
            borderRadius: "14px",
            marginBottom: "25px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px" }}>
            Admin Dashboard
          </h1>

          <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
            Employee Task & Reporting Portal
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          <DashboardCard
            title="Employees"
            value="0"
            description="Manage employees"
          />

          <DashboardCard
            title="Tasks"
            value="0"
            description="View and manage tasks"
          />

          <DashboardCard
            title="Pending"
            value="0"
            description="Tasks awaiting completion"
          />

          <DashboardCard
            title="Reports"
            value="0"
            description="Review submitted reports"
          />
        </section>

        <section
          style={{
            background: "white",
            marginTop: "25px",
            padding: "25px",
            borderRadius: "14px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Admin Actions</h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button className="admin-button">
              Add Employee
            </button>

            <button className="admin-button">
              View Employees
            </button>

            <button className="admin-button">
              View Tasks
            </button>

            <button className="admin-button">
              View Reports
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .admin-button {
          border: none;
          background: #111827;
          color: white;
          padding: 12px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .admin-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "14px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          fontSize: "32px",
          margin: "10px 0",
        }}
      >
        {value}
      </h2>

      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "13px",
        }}
      >
        {description}
      </p>
    </div>
  );
}