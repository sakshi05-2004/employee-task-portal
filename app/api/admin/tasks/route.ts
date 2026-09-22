import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { requireRole } from "@/lib/auth/guards";

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

// CREATE TASK
export async function POST(request: Request) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { title, description, assignedTo, dueDate, priority } =
      await request.json();

    if (!title || !assignedTo) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and employee are required",
        },
        { status: 400 }
      );
    }

    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid priority",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      assignedTo,
      createdBy: auth.user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "medium",
      status: "pending",
    });

    await task.populate(
      "assignedTo",
      "name designation email"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create task",
      },
      { status: 500 }
    );
  }
}

// GET ALL TASKS
export async function GET() {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    await connectDB();

    const tasks = await Task.find()
      .populate("assignedTo", "name designation email")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load tasks",
      },
      { status: 500 }
    );
  }
}