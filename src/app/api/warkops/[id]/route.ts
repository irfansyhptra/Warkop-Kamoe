import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Warkop from "@/models/Warkop";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const warkop = await Warkop.findById(id);

    if (!warkop) {
      return NextResponse.json({ error: "Warkop not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { warkop },
    });
  } catch (error) {
    console.error("Get warkop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const warkop = await Warkop.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!warkop) {
      return NextResponse.json({ error: "Warkop not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Warkop updated successfully",
      data: { warkop },
    });
  } catch (error) {
    console.error("Update warkop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const warkop = await Warkop.findByIdAndDelete(id);

    if (!warkop) {
      return NextResponse.json({ error: "Warkop not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Warkop deleted successfully",
    });
  } catch (error) {
    console.error("Delete warkop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
