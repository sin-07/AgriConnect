import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

// GET /api/orders/my-orders — buyer's orders
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    const orders = await Order.find({ buyer: user._id })
      .populate("items.product", "name imageUrl")
      .sort("-createdAt");

    return jsonSuccess({ orders });
  } catch (error: unknown) {
    console.error("Get buyer orders error:", error);
    return jsonError("Server error", 500);
  }
}
