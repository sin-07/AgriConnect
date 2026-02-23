import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/products/:id — public
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).populate("farmer", "name email phone address");

    if (!product) return jsonError("Product not found", 404);

    return jsonSuccess({ product });
  } catch (error: unknown) {
    console.error("Get product error:", error);
    return jsonError("Server error", 500);
  }
}

// PUT /api/products/:id — farmer updates own product
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role !== "farmer") return jsonError("Only farmers can update products", 403);

    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return jsonError("Product not found", 404);

    if (product.farmer.toString() !== (user._id as unknown as string).toString()) {
      return jsonError("Not authorized to update this product", 403);
    }

    const body = await req.json();
    const updated = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    return jsonSuccess(updated, 200, "Product updated");
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "ValidationError") return jsonError(err.message, 400);
    console.error("Update product error:", err);
    return jsonError("Server error", 500);
  }
}

// DELETE /api/products/:id — farmer deletes own product
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role !== "farmer") return jsonError("Only farmers can delete products", 403);

    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return jsonError("Product not found", 404);

    if (product.farmer.toString() !== (user._id as unknown as string).toString()) {
      return jsonError("Not authorized to delete this product", 403);
    }

    await Product.findByIdAndDelete(id);
    return jsonSuccess(null, 200, "Product deleted");
  } catch (error: unknown) {
    console.error("Delete product error:", error);
    return jsonError("Server error", 500);
  }
}
