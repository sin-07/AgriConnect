import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order, { IOrderItem } from "@/models/Order";
import User from "@/models/User";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/orders/:id/status — farmer updates order status
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role !== "farmer") return jsonError("Only farmers can update order status", 403);

    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) return jsonError("Order not found", 404);

    const userId = (user._id as unknown as string).toString();
    const isFarmer = order.items.some(
      (item: IOrderItem) => item.farmer.toString() === userId
    );
    if (!isFarmer) return jsonError("Not authorized to update this order", 403);

    const { status } = await req.json();
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return jsonError(
        `Cannot change status from '${order.status}' to '${status}'`,
        400
      );
    }

    order.status = status;
    await order.save();

    // Send status update email to buyer
    try {
      const buyer = await User.findById(order.buyer).select("name email role");
      if (buyer) {
        sendOrderStatusEmail(
          {
            _id: String(order._id),
            items: order.items as never,
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress,
            status,
          },
          { name: buyer.name, email: buyer.email, role: buyer.role }
        , status).catch((err) => console.error("Status email error:", err));
      }
    } catch (emailErr) {
      console.error("Status email lookup error:", emailErr);
    }

    return jsonSuccess({ order }, 200, "Order status updated");
  } catch (error: unknown) {
    console.error("Update order status error:", error);
    return jsonError("Server error", 500);
  }
}
