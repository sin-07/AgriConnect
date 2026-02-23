import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

// PATCH /api/cart/[productId] — update quantity for a single item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    const { quantity } = await req.json();
    if (!quantity || quantity < 1)
      return jsonError("quantity must be >= 1", 400);

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) return jsonError("Cart not found", 404);

    const item = cart.items.find(
      (i: { product: { toString: () => string } }) =>
        i.product.toString() === params.productId
    );
    if (!item) return jsonError("Item not in cart", 404);

    item.quantity = quantity;
    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      populate: { path: "farmer", select: "name address" },
    });

    return jsonSuccess({ items: populated.items });
  } catch (error) {
    console.error("PATCH /api/cart/[productId] error:", error);
    return jsonError("Server error", 500);
  }
}

// DELETE /api/cart/[productId] — remove a single item from the cart
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    await Cart.findOneAndUpdate(
      { user: user._id },
      { $pull: { items: { product: params.productId } } }
    );

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      populate: { path: "farmer", select: "name address" },
    });

    return jsonSuccess({ items: cart?.items ?? [] });
  } catch (error) {
    console.error("DELETE /api/cart/[productId] error:", error);
    return jsonError("Server error", 500);
  }
}
