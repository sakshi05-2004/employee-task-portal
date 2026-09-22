import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";
import Task from "@/models/Task";
import { requireRole } from "@/lib/auth/guards";

// SUBMIT REPORT
export async function POST(request: Request) {
  try {
    const auth = await requireRole("employee");
    if (auth.error) return auth.error;

    const {
      task,
      summary,
      documentLink,
    } = await request.json();

    if (!task || !summary) {
      return NextResponse.json(
        {
          success: false,
          message: "Task and summary are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const assignedTask = await Task.findOne({
      _id: task,
      assignedTo: auth.user.id,
    });

    if (!assignedTask) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found or access denied",
        },
        { status: 404 }
      );
    }

    const report = await Report.create({
      task,
      employee: auth.user.id,
      summary: summary.trim(),
      documentLink: documentLink?.trim() || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit report error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit report",
      },
      { status: 500 }
    );
  }
}

// GET REPORTS FOR LOGGED-IN EMPLOYEE
export async function GET() {
  try {
    const auth = await requireRole("employee");
    if (auth.error) return auth.error;

    await connectDB();

    const reports = await Report.find({
      employee: auth.user.id,
    })
      .populate("task", "title status dueDate")
      .sort({ submittedAt: -1 });

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get employee reports error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load employee reports",
      },
      { status: 500 }
    );
  }
}
