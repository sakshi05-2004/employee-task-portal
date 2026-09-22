import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";

// GET TASKS FOR AN EMPLOYEE
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const tasks = await Task.find({
      assignedTo: employeeId,
    })
      .populate("assignedTo", "name designation email")
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

// UPDATE TASK STATUS
export async function PATCH(request: Request) {
  try {
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

    const task = await Task.findByIdAndUpdate(
      taskId,
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
          message: "Task not found",
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