import Link from "next/link";
import Logo from "@/components/Logo";

const FEATURES = [
  {
    title: "Kanban task boards",
    description:
      "Drag tasks across To Do, In Progress and Completed — for the whole team or just your own work.",
  },
  {
    title: "Assign or self-assign",
    description:
      "Admins allot work to the team, and employees can add tasks to their own board too.",
  },
  {
    title: "Comments & insights",
    description:
      "Discuss progress right on the task — admins can leave feedback, questions and guidance.",
  },
  {
    title: "Shared documents",
    description:
      "Paste Google Drive, OneDrive or SharePoint links so everyone can open the details in one click.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="flex-1 bg-gradient-to-b from-brand-50/70 to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
            Internal tool for the Startup Stairs team
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            One place to assign, track and discuss every task
          </h1>
          <p className="max-w-xl text-base text-ink-500">
            The Startup Stairs Task Portal keeps admins and employees aligned
            with Kanban boards, performance-ready reporting and a running
            conversation on every piece of work.
          </p>
          <Link
            href="/login"
            className="rounded-xl bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-ink-900/10 transition hover:bg-ink-800"
          >
            Sign in to your portal →
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-ink-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-ink-500">{feature.description}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-ink-100 bg-white py-6">
        <p className="text-center text-xs text-ink-400">
          © {new Date().getFullYear()} Startup Stairs. Internal use only.
        </p>
      </footer>
    </div>
  );
}
