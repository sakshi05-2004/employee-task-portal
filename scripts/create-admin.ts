import bcrypt from "bcryptjs";
import connectDB from "../lib/mongodb";
import Employee from "../models/Employee";

async function createAdmin() {
  try {
    await connectDB();

    const password = "ChangeThisPassword123!";

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await Employee.findOne({
      email: "admin@employeeportal.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    await Employee.create({
      name: "Admin",
      designation: "Administrator",
      email: "admin@employeeportal.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      mustChangePassword: false,
    });

    console.log("Admin created successfully.");
    console.log("Email: admin@employeeportal.com");
    console.log("Password: ChangeThisPassword123!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();