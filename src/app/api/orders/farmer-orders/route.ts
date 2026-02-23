import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

// GET /api/orders/farmer-orders — orders containing farmer's products
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role !== "farmer") return jsonError("Only farmers can access this", 403);

    const orders = await Order.find({ "items.farmer": user._id })
      .populate("buyer", "name email phone")
      .populate("items.product", "name imageUrl")
      .sort("-createdAt");

    return jsonSuccess({ orders });
  } catch (error: unknown) {
    console.error("Get farmer orders error:", error);
    return jsonError("Server error", 500);
  }
}
