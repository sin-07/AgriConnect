import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

// GET /api/products/farmer/my-products — farmer's own products
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role !== "farmer") return jsonError("Only farmers can access this", 403);

    const products = await Product.find({ farmer: user._id }).sort("-createdAt");

    return jsonSuccess({ products });
  } catch (error: unknown) {
    console.error("Get farmer products error:", error);
    return jsonError("Server error", 500);
  }
}
