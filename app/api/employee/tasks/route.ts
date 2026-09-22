import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { requireRole } from "@/lib/auth/guards";

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

// GET TASKS FOR LOGGED-IN EMPLOYEE
export async function GET() {
  try {
    const auth = await requireRole("employee");
    if (auth.error) return auth.error;

    await connectDB();

    const tasks = await Task.find({
      assignedTo: auth.user.id,
    })
      .populate("assignedTo", "name designation email")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get employee tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load employee tasks",
      },
      { status: 500 }
    );
  }
}

// SELF-ASSIGN A NEW TASK
export async function POST(request: Request) {
  try {
    const auth = await requireRole("employee");
    if (auth.error) return auth.error;

    const { title, description, dueDate, priority } = await request.json();

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        { status: 400 }
      );
    }

    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { success: false, message: "Invalid priority" },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      assignedTo: auth.user.id,
      createdBy: auth.user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "medium",
      status: "pending",
    });

    await task.populate("assignedTo", "name designation email");
    await task.populate("createdBy", "name role");

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Self-assign task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task",
      },
      { status: 500 }
    );
  }
}

// UPDATE TASK STATUS
export async function PATCH(request: Request) {
  try {
    const auth = await requireRole("employee");
    if (auth.error) return auth.error;

    const { taskId, status } = await request.json();

    if (!taskId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Task ID and status are required",
        },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "pending",
      "in-progress",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task status",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        assignedTo: auth.user.id,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("assignedTo", "name designation email");

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found or access denied",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update task status",
      },
      { status: 500 }
    );
  }
}
