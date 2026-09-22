import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { requireUser } from "@/lib/auth/guards";

const ALLOWED_STATUSES = ["pending", "in-progress", "completed"];
const ALLOWED_PRIORITIES = ["low", "medium", "high"];

// Fields an employee may only change on a task they created themselves
// (i.e. a task they self-assigned). Status is handled separately since
// any assignee may move their own task across the board.
const CREATOR_ONLY_FIELDS = [
  "title",
  "description",
  "dueDate",
  "priority",
  "assignedTo",
] as const;

async function loadTaskForUser(
  id: string,
  user: { id: string; role: "admin" | "employee" }
) {
  await connectDB();

  const task = await Task.findById(id)
    .populate("assignedTo", "name designation email")
    .populate("createdBy", "name role");

  if (!task) return { task: null, allowed: false };

  // Older tasks created before self-assignment shipped may not have a
  // createdBy value populated yet — treat that as "no creator", which
  // still leaves admins with full access and the assignee with status
  // control, just not full-detail edit rights.
  const isAdmin = user.role === "admin";
  const isAssignee = task.assignedTo?._id?.toString() === user.id;
  const isCreator = task.createdBy?._id?.toString() === user.id;

  return {
    task,
    allowed: isAdmin || isAssignee || isCreator,
    isAdmin,
    isAssignee,
    isCreator,
  };
}

// GET TASK DETAIL
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const { task, allowed } = await loadTaskForUser(id, auth.user);

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("Get task error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load task" },
      { status: 500 }
    );
  }
}

// UPDATE TASK
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const body = await request.json();

    const { task, allowed, isAdmin, isAssignee, isCreator } =
      await loadTaskForUser(id, auth.user);

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: "Invalid task status" },
          { status: 400 }
        );
      }

      if (!isAdmin && !isAssignee) {
        return NextResponse.json(
          {
            success: false,
            message: "Only the assigned employee can update task status",
          },
          { status: 403 }
        );
      }

      task.status = body.status;
    }

    const wantsCreatorFieldChange = CREATOR_ONLY_FIELDS.some(
      (field) => body[field] !== undefined
    );

    if (wantsCreatorFieldChange) {
      if (!isAdmin && !isCreator) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only an admin or the task creator can edit these details",
          },
          { status: 403 }
        );
      }

      if (body.title !== undefined) {
        if (!body.title.trim()) {
          return NextResponse.json(
            { success: false, message: "Title cannot be empty" },
            { status: 400 }
          );
        }
        task.title = body.title.trim();
      }

      if (body.description !== undefined) {
        task.description = body.description?.trim() || undefined;
      }

      if (body.dueDate !== undefined) {
        task.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
      }

      if (body.priority !== undefined) {
        if (!ALLOWED_PRIORITIES.includes(body.priority)) {
          return NextResponse.json(
            { success: false, message: "Invalid priority" },
            { status: 400 }
          );
        }
        task.priority = body.priority;
      }

      if (body.assignedTo !== undefined) {
        if (!isAdmin) {
          return NextResponse.json(
            { success: false, message: "Only an admin can reassign a task" },
            { status: 403 }
          );
        }
        task.assignedTo = body.assignedTo;
      }
    }

    // Only re-validate changed fields — a plain .save() re-validates the
    // whole document, which would fail for a legacy task missing a
    // field added since (e.g. createdBy, before self-assignment shipped).
    await task.save({ validateModifiedOnly: true });
    await task.populate("assignedTo", "name designation email");
    await task.populate("createdBy", "name role");

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE TASK (admin only)
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/tasks/[id]">
) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    if (auth.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Only an admin can delete a task" },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;

    await connectDB();

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete task" },
      { status: 500 }
    );
  }
}
