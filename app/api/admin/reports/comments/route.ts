import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";

export async function PATCH(request: Request) {
  try {
    const { reportId, adminComment } = await request.json();

    if (!reportId || !adminComment) {
      return NextResponse.json(
        {
          success: false,
          message: "Report ID and comment are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        adminComment: adminComment.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: "Report not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin comment added successfully",
      report,
    });
  } catch (error) {
    console.error("Add admin comment error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add admin comment",
      },
      { status: 500 }
    );
  }
}