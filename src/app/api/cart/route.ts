import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

// GET /api/cart — fetch the authenticated user's cart (products populated)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      populate: { path: "farmer", select: "name address" },
    });

    return jsonSuccess({ items: cart?.items ?? [] });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return jsonError("Server error", 500);
  }
}

// POST /api/cart — add or update an item { productId, quantity }
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    const { productId, quantity } = await req.json();
    if (!productId || !quantity || quantity < 1)
      return jsonError("productId and quantity (>= 1) are required", 400);

    const cart = await Cart.findOneAndUpdate(
      { user: user._id },
      // Upsert: if the item already exists, set quantity; otherwise push a new one
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const existing = cart.items.find(
      (i: { product: { toString: () => string } }) => i.product.toString() === productId
    );
    if (existing) {
      existing.quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();

    const populated = await cart.populate({
      path: "items.product",
      populate: { path: "farmer", select: "name address" },
    });

    return jsonSuccess({ items: populated.items });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return jsonError("Server error", 500);
  }
}

// DELETE /api/cart — clear the entire cart
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    await Cart.findOneAndUpdate({ user: user._id }, { items: [] }, { upsert: true });
    return jsonSuccess({ items: [] });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return jsonError("Server error", 500);
  }
}
