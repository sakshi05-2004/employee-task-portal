import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";
import { requireRole } from "@/lib/auth/guards";

// GET ALL REPORTS
export async function GET() {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    await connectDB();

    const reports = await Report.find()
      .populate("task", "title description status dueDate")
      .populate("employee", "name designation email")
      .sort({ submittedAt: -1 });

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Get admin reports error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load reports",
      },
      { status: 500 }
    );
  }
}
