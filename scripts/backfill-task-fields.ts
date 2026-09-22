// One-time migration: tasks created before self-assignment, priority and
// shared links shipped won't have `createdBy` / `priority` / `links` set.
// The app tolerates missing `createdBy` (admins still have full access,
// the assignee just can't self-edit the task's details), but running this
// once backfills them for a clean, fully-featured record.
//
// Usage: npm run backfill:tasks

import connectDB from "../lib/mongodb";
import Task from "../models/Task";

async function backfill() {
  try {
    await connectDB();

    const result = await Task.updateMany(
      { createdBy: { $exists: false } },
      [
        {
          $set: {
            // Best guess for legacy tasks: they were all admin-assigned
            // before self-assignment existed, so falling back to the
            // assignee keeps them editable rather than orphaned.
            createdBy: "$assignedTo",
            priority: { $ifNull: ["$priority", "medium"] },
            links: { $ifNull: ["$links", []] },
          },
        },
      ]
    );

    console.log(
      `Backfilled ${result.modifiedCount} task(s) missing createdBy/priority/links.`
    );

    process.exit(0);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

backfill();
