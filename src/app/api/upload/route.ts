import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// POST /api/upload — upload an image to Cloudinary
// Only authenticated farmers (or any logged-in user) can upload
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return jsonError("No file provided", 400);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return jsonError("Invalid file type. Only JPEG, PNG and WebP are allowed", 400);
    }

    // Validate file size (max 5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return jsonError("File too large. Maximum size is 5 MB", 400);
    }

    // Convert File → ArrayBuffer → Buffer → base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "agriconnect/products",
      // Resize to a sensible max (keep aspect ratio) and convert to WebP
      transformation: [
        { width: 1200, height: 900, crop: "limit", quality: "auto", fetch_format: "webp" },
      ],
    });

    return jsonSuccess(
      {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      200,
      "Image uploaded successfully"
    );
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const err = error as { message?: string };
    return jsonError(err.message || "Upload failed", 500);
  }
}
