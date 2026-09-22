import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import Comment from "@/models/Comment";
import { requireUser } from "@/lib/auth/guards";

async function canAccessTask(
  taskId: string,
  user: { id: string; role: "admin" | "employee" }
) {
  const task = await Task.findById(taskId, "assignedTo createdBy");

  if (!task) return false;

  return (
    user.role === "admin" ||
    task.assignedTo?.toString() === user.id ||
    task.createdBy?.toString() === user.id
  );
}

// GET COMMENT THREAD FOR A TASK
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/tasks/[id]/comments">
) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;

    await connectDB();

    if (!(await canAccessTask(id, auth.user))) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const comments = await Comment.find({ task: id })
      .populate("sender", "name role designation")
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("Get comments error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load comments" },
      { status: 500 }
    );
  }
}

// POST A COMMENT / INSIGHT ON A TASK
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/tasks/[id]/comments">
) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: "Comment message is required" },
        { status: 400 }
      );
    }

    await connectDB();

    if (!(await canAccessTask(id, auth.user))) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const comment = await Comment.create({
      task: id,
      sender: auth.user.id,
      message: message.trim(),
    });

    await comment.populate("sender", "name role designation");

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add comment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to add comment" },
      { status: 500 }
    );
  }
}
