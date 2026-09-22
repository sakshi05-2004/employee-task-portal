import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookie";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current and new password are required",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password must be different from the current password",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const employee = await Employee.findById(user.id);

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 }
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      employee.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    employee.password = await bcrypt.hash(newPassword, 10);
    employee.mustChangePassword = false;

    // Only re-validate the fields actually being changed — a plain
    // .save() re-validates the whole document, which would fail here
    // for any account whose existing data predates a field added since
    // (e.g. `designation` on an older seed).
    await employee.save({ validateModifiedOnly: true });

    const sessionToken = await createSession({
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      role: employee.role,
      mustChangePassword: false,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });

    setSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update password" },
      { status: 500 }
    );
  }
}
