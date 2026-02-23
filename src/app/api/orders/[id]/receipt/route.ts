import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order, { IOrderItem } from "@/models/Order";
import { getAuthUser, jsonError } from "@/lib/auth";
import { generateReceiptPDF } from "@/lib/pdf";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/orders/:id/receipt — download PDF receipt (only for delivered orders)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    const { id } = await params;
    const order = await Order.findById(id).populate("buyer", "name email");
    if (!order) return jsonError("Order not found", 404);

    // Only the buyer or farmer involved can download
    const buyerId = (order.buyer as { _id: { toString(): string } })._id.toString();
    const userId = (user._id as { toString(): string }).toString();
    const isBuyer = buyerId === userId;
    const isFarmer =
      user.role === "farmer" &&
      order.items.some(
        (item: IOrderItem) => item.farmer.toString() === userId
      );

    if (!isBuyer && !isFarmer) return jsonError("Not authorized", 403);
    if (order.status !== "delivered") return jsonError("Receipt is only available for delivered orders", 400);

    const buyer = order.buyer as { name: string; email: string };

    const pdfBuffer = await generateReceiptPDF({
      orderId: String(order._id),
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      items: order.items.map((item: IOrderItem) => ({
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        subtotal: item.subtotal,
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      deliveredAt: order.updatedAt,
    });

    const shortId = String(order._id).slice(-8).toUpperCase();
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="AgriConnect_Receipt_${shortId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Receipt download error:", error);
    return jsonError("Server error", 500);
  }
}
