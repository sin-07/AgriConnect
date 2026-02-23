import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/orders/:id
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    const { id } = await params;
    const order = await Order.findById(id)
      .populate("buyer", "name email phone")
      .populate("items.product", "name imageUrl");

    if (!order) return jsonError("Order not found", 404);

    const userId = (user._id as unknown as string).toString();
    const isBuyer = order.buyer._id.toString() === userId;
    const isFarmer = order.items.some(
      (item: any) => item.farmer.toString() === userId
    );

    if (!isBuyer && !isFarmer) {
      return jsonError("Not authorized to view this order", 403);
    }

    return jsonSuccess({ order });
  } catch (error: unknown) {
    console.error("Get order error:", error);
    return jsonError("Server error", 500);
  }
}
