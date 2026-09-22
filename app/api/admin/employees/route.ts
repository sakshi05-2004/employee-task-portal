import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { requireRole } from "@/lib/auth/guards";

const DEFAULT_PASSWORD = "Employee@123";

// CREATE EMPLOYEE
export async function POST(request: Request) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { name, designation, email } = await request.json();

    if (!name || !designation || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, designation and email are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const existingEmployee = await Employee.findOne({
      email: normalizedEmail,
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          success: false,
          message: "An employee with this email already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const employee = await Employee.create({
      name: name.trim(),
      designation: designation.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "employee",
      isActive: true,
      mustChangePassword: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully",
        defaultPassword: DEFAULT_PASSWORD,
        employee: {
          id: employee._id,
          name: employee.name,
          designation: employee.designation,
          email: employee.email,
          role: employee.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create employee error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}

// GET ALL EMPLOYEES
export async function GET() {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    await connectDB();

    const employees = await Employee.find(
      { role: "employee" },
      { password: 0 }
    ).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load employees",
      },
      { status: 500 }
    );
  }
}

// UPDATE EMPLOYEE
export async function PUT(request: Request) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { id, name, designation, email, isActive } =
      await request.json();

    if (!id || !name || !designation || !email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Employee ID, name, designation and email are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    const existingEmployee = await Employee.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          success: false,
          message: "Another employee already uses this email",
        },
        { status: 409 }
      );
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        designation: designation.trim(),
        email: normalizedEmail,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update employee",
      },
      { status: 500 }
    );
  }
}

// RESET EMPLOYEE PASSWORD
export async function PATCH(request: Request) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        mustChangePassword: true,
      },
      {
        new: true,
      }
    ).select("-password");

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Employee password reset successfully",
      defaultPassword: DEFAULT_PASSWORD,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset employee password",
      },
      { status: 500 }
    );
  }
}