import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  designation: string;
  email: string;
  password: string;
  role: "admin" | "employee";
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // True whenever the employee is still on a password they did not
    // choose themselves (a freshly created account or one that had its
    // password reset by an admin). The login flow forces a password
    // change before anything else is accessible while this is true.
    mustChangePassword: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Employee: Model<IEmployee> =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;