import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

// POST /api/orders — buyer creates an order
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role === "farmer") return jsonError("Farmers cannot place orders", 403);

    const { items, shippingAddress, paymentMethod, notes } = await req.json();

    if (!items || !items.length) return jsonError("Order must have at least one item", 400);
    if (!shippingAddress) return jsonError("Shipping address is required", 400);

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return jsonError(`Product ${item.productId} not found`, 404);

      const stockType = user.role === "industrial" ? "industrial" : "local";
      const availableStock =
        stockType === "industrial" ? product.industrialStock : product.localStock;

      if (item.quantity > availableStock) {
        return jsonError(
          `Insufficient ${stockType} stock for ${product.name}. Available: ${availableStock}`,
          400
        );
      }

      const subtotal = product.pricePerUnit * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        farmer: product.farmer,
        quantity: item.quantity,
        pricePerUnit: product.pricePerUnit,
        unit: product.unit,
        stockType,
        subtotal,
      });

      if (stockType === "industrial") {
        product.industrialStock -= item.quantity;
      } else {
        product.localStock -= item.quantity;
      }
      await product.save();
    }

    const order = await Order.create({
      buyer: user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      notes,
    });

    // Send order confirmation email
    sendOrderConfirmationEmail(
      { _id: String(order._id), items: orderItems, totalAmount, shippingAddress, status: "pending", createdAt: order.createdAt },
      { name: user.name, email: user.email, role: user.role }
    ).catch((err) => console.error("Order confirmation email error:", err));

    return jsonSuccess({ order }, 201, "Order placed successfully");
  } catch (error: unknown) {
    console.error("Create order error:", error);
    return jsonError("Server error", 500);
  }
}
