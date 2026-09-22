import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReport extends Document {
  task: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  summary: string;
  documentLink?: string;
  submittedAt: Date;
  adminComment?: string;
}

const ReportSchema = new Schema<IReport>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    // Employee pastes a Google Drive / OneDrive / SharePoint link.
    // No document is uploaded or stored in the application.
    documentLink: {
      type: String,
      trim: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    adminComment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Report: Model<IReport> =
  mongoose.models.Report ||
  mongoose.model<IReport>("Report", ReportSchema);

export default Report;