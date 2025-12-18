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
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Transform openingHours if it's array of strings to proper format
    let formattedOpeningHours = [];
    if (openingHours && Array.isArray(openingHours)) {
      if (typeof openingHours[0] === 'string') {
        // If it's array of strings like ["24 Hours"] or ["08:00 - 22:00"]
        const hoursString = openingHours[0];
        if (hoursString === "24 Hours") {
          // Create 24 hours schedule
          const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
          formattedOpeningHours = days.map(day => ({
            day,
            open: "00:00",
            close: "23:59",
            isOpen: true,
          }));
        } else {
          // Parse time range like "08:00 - 22:00"
          const [open, close] = hoursString.split(" - ");
          const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
          formattedOpeningHours = days.map(day => ({
            day,
            open: open || "08:00",
            close: close || "22:00",
            isOpen: true,
          }));
        }
      } else {
        // Already in proper format
        formattedOpeningHours = openingHours;
      }
    }

    const warkop = await Warkop.create({
      name,
      description,
      ownerId,
      images: images || [],
      address,
      city,
      phone,
      openingHours: formattedOpeningHours,
      categories: categories || [],
      facilities: facilities || [],
      latitude: latitude || 0,
      longitude: longitude || 0,
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
    // Return more detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
