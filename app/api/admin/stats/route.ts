import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import Employee from "@/models/Employee";
import Report from "@/models/Report";
import { requireRole } from "@/lib/auth/guards";

export async function GET() {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    await connectDB();

    const [
      totalEmployees,
      activeEmployees,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      totalReports,
      reportsAwaitingComment,
    ] = await Promise.all([
      Employee.countDocuments({ role: "employee" }),
      Employee.countDocuments({ role: "employee", isActive: true }),
      Task.countDocuments(),
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "in-progress" }),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({
        status: { $ne: "completed" },
        dueDate: { $lt: new Date() },
      }),
      Report.countDocuments(),
      Report.countDocuments({
        $or: [{ adminComment: { $exists: false } }, { adminComment: "" }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        totalReports,
        reportsAwaitingComment,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
