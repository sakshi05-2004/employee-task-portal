import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITaskLink {
  _id: mongoose.Types.ObjectId;
  label: string;
  url: string;
  addedBy: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  links: ITaskLink[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskLinkSchema = new Schema<ITaskLink>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    // Employees / admins paste a Google Drive, OneDrive, SharePoint, etc.
    // link. No files are uploaded or stored by the application.
    url: {
      type: String,
      required: true,
      trim: true,
    },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // Who created the task — an admin assigning work, or an employee
    // allotting a task to themselves. Employees are allowed to fully
    // edit (and admins can always edit/delete) only the tasks they
    // created themselves.
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: {
      type: Date,
    },

    links: {
      type: [TaskLinkSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> =
  mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);

export default Task;
