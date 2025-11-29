import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: Record<string, unknown> = {};

    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message === "Unauthorized" || error.message.includes("Forbidden"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
