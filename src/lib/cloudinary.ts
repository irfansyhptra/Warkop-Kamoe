import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  file: string,
  folder: string = "warkop-kamoe"
) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
      // Optimize upload
      transformation: [
        { width: 1000, height: 1000, crop: "limit" }, // Limit size
        { quality: "auto:good" }, // Auto quality
        { fetch_format: "auto" }, // Auto format (WebP if supported)
      ],
      timeout: 60000, // 60 seconds timeout
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
    throw new Error(errorMessage);
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
};

export default cloudinary;
