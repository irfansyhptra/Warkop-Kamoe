import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Warkop from "@/models/Warkop";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const category = searchParams.get("category");
    const verified = searchParams.get("verified");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: Record<string, unknown> = { isActive: true };

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (category) {
      query.categories = category;
    }

    if (verified === "true") {
      query.isVerified = true;
    }

    const skip = (page - 1) * limit;

    const [warkops, total] = await Promise.all([
      Warkop.find(query)
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Warkop.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        warkops,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get warkops error:", error);
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
      name,
      description,
      ownerId,
      images,
      address,
      city,
      phone,
      openingHours,
      categories,
      facilities,
      latitude,
      longitude,
    } = body;

    // Validation
    if (!name || !description || !ownerId || !address || !city || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const warkop = await Warkop.create({
      name,
      description,
      ownerId,
      images: images || [],
      address,
      city,
      phone,
      openingHours: openingHours || [],
      categories: categories || [],
      facilities: facilities || [],
      latitude,
      longitude,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Warkop created successfully",
        data: { warkop },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create warkop error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
