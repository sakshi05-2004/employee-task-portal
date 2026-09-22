import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

// CREATE TASK
export async function POST(request: Request) {
  try {
    const { title, description, assignedTo, dueDate } =
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

    await connectDB();

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim(),
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: "pending",
    });

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
    await connectDB();

    const tasks = await Task.find()
      .populate("assignedTo", "name designation email")
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