import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task, { type ITaskLink } from "@/models/Task";
import { requireUser } from "@/lib/auth/guards";

// ADD A SHARED DOCUMENT LINK TO A TASK
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/tasks/[id]/links">
) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    const { label, url } = await request.json();

    if (!url || !url.trim()) {
      return NextResponse.json(
        { success: false, message: "A link URL is required" },
        { status: 400 }
      );
    }

    let normalizedUrl = url.trim();

    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Please provide a valid URL" },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.findById(id, "assignedTo createdBy links");

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    const canAccess =
      auth.user.role === "admin" ||
      task.assignedTo?.toString() === auth.user.id ||
      task.createdBy?.toString() === auth.user.id;

    if (!canAccess) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    task.links.push({
      label: label?.trim() || normalizedUrl,
      url: normalizedUrl,
      addedBy: auth.user.id,
      addedAt: new Date(),
    } as unknown as ITaskLink);

    // Only re-validate the modified `links` array — this query doesn't
    // even select every field, and a legacy task missing a field added
    // since (e.g. createdBy) shouldn't block adding a link to it.
    await task.save({ validateModifiedOnly: true });
    await task.populate("links.addedBy", "name role");

    return NextResponse.json(
      {
        success: true,
        message: "Link shared successfully",
        links: task.links,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add task link error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to share link" },
      { status: 500 }
    );
  }
}
