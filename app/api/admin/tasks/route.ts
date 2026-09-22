import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { getCurrentUser } from "@/lib/auth/current-user";

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

// CREATE TASK (admin assigning a task to an employee)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

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
        { success: false, message: "Invalid priority" },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      assignedTo,
      createdBy: user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || "medium",
      status: "pending",
    });

    await task.populate("assignedTo", "name designation email");

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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

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
