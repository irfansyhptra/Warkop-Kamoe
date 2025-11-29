import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Warkop from "@/models/Warkop";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    requireAdmin(request);
    const { id } = await context.params;
    const body = await request.json();
    const { isVerified } = body;

    const warkop = await Warkop.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    );

    if (!warkop) {
      return NextResponse.json({ error: "Warkop not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Warkop ${isVerified ? "verified" : "unverified"} successfully`,
      data: { warkop },
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message.includes("Forbidden"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Verify warkop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
