# Startup Stairs — Task Portal

An internal task management portal for the Startup Stairs team: admins assign
and track work across the team, employees manage their own board and can
allot tasks to themselves, and every task carries its own comment thread and
shared document links.

## Features

- **Kanban boards** — drag and drop (or use the ←/→ controls) across To Do,
  In Progress and Completed. Admins see the whole team's board and can filter
  by employee; employees see their own.
- **Admin or self-assigned tasks** — admins assign work to anyone; employees
  can add tasks to their own board too.
- **Forced password change** — new employees (and anyone whose password is
  reset) sign in with a shared default password and are required to set
  their own before they can do anything else.
- **Comments & insights** — a running discussion thread on every task, so
  admins can leave feedback, questions or guidance and employees can reply.
- **Shared document links** — paste a Google Drive / OneDrive / SharePoint
  link on a task or a report; no file upload, just a link everyone can open.
- **Reports** — employees submit a summary + link per task; admins review
  and reply with a comment.
- **Role-based access** — enforced both in the UI (`proxy.ts`) and on every
  API route (`lib/auth/guards.ts`), so admin and employee areas stay separate.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with:

   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=a-long-random-string
   ```

3. Seed the first admin account:

   ```bash
   npm run seed:admin
   ```

   This creates `admin@employeeportal.com` with password
   `ChangeThisPassword123!` — sign in and change it right away from the
   navbar's "Change Password" link.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. From the admin dashboard, add employees under **Employees → Add
   Employee**. Each new employee gets a default password (shown once on
   screen) and must change it on first login.

### Upgrading an existing database

If you already had tasks in the database before self-assignment, priority
and shared links were added, run this once to backfill those tasks:

```bash
npm run backfill:tasks
```

## Project structure

- `app/admin/**` — admin dashboard, task board, task list/detail, employee
  management, reports.
- `app/employee/**` — employee's personal board, task detail, reports.
- `app/api/**` — route handlers (task/employee/report CRUD, auth, comments,
  links).
- `components/**` — shared UI: `KanbanBoard`, `TaskCard`, `TaskDetail`,
  `CommentThread`, `LinkList`, `Navbar`.
- `models/**` — Mongoose schemas (`Employee`, `Task`, `Report`, `Comment`).
- `proxy.ts` — route protection (Next.js 16's renamed `middleware.ts`):
  gates admin/employee areas, forces the password-change flow, and keeps
  each role in its own area.

## Tech

Next.js 16 (App Router), React 19, Tailwind CSS v4, MongoDB/Mongoose,
JWT sessions (`jose`), bcrypt password hashing.
