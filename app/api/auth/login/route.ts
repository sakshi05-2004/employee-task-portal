import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookie";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const employee = await Employee.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      employee.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionToken = await createSession({
      id: employee._id.toString(),
      name: employee.name,
      email: employee.email,
      role: employee.role,
      mustChangePassword: employee.mustChangePassword,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        mustChangePassword: employee.mustChangePassword,
      },
    });

    setSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
