import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);

    // Check content type
    const contentType = request.headers.get("content-type") || "";
    console.log("Upload request content-type:", contentType);
    
    if (!contentType.includes("multipart/form-data")) {
      console.error("Invalid content-type:", contentType);
      return NextResponse.json(
        { success: false, error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "warkop-kamoe";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    console.log(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to Cloudinary...`);

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary with timeout handling
    const result = await uploadImage(base64, folder);

    console.log(`Successfully uploaded to: ${result.url}`);

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      url: result.url, // Direct URL for easier access
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
