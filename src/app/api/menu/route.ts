import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const warkopId = searchParams.get("warkopId");
    const category = searchParams.get("category");
    const availability = searchParams.get("availability");
    const recommended = searchParams.get("recommended");

    const query: Record<string, unknown> = {};

    if (warkopId) {
      query.warkopId = warkopId;
    }

    if (category) {
      query.category = category;
    }

    if (availability) {
      query.availability = availability;
    }

    if (recommended === "true") {
      query.isRecommended = true;
    }

    const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: { menuItems },
    });
  } catch (error) {
    console.error("Get menu items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      warkopId,
      name,
      description,
      price,
      category,
      image,
      availability,
      isRecommended,
      ingredients,
      protein,
      calories,
      preparationTime,
    } = body;

    // Validation
    if (!warkopId || !name || !description || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const menuItem = await MenuItem.create({
      warkopId,
      name,
      description,
      price,
      category,
      image,
      availability: availability || "available",
      isRecommended: isRecommended || false,
      ingredients: ingredients || [],
      protein,
      calories,
      preparationTime,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Menu item created successfully",
        data: { menuItem },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create menu item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
