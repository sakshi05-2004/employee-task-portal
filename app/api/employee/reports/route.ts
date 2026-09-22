import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";

// SUBMIT REPORT
export async function POST(request: Request) {
  try {
    const {
      task,
      employee,
      summary,
      documentLink,
    } = await request.json();

    if (!task || !employee || !summary) {
      return NextResponse.json(
        {
          success: false,
          message: "Task, employee and summary are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const report = await Report.create({
      task,
      employee,
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

// GET REPORTS FOR AN EMPLOYEE
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

    const reports = await Report.find({
      employee: employeeId,
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
        message: "Failed to load reports",
      },
      { status: 500 }
    );
  }
}