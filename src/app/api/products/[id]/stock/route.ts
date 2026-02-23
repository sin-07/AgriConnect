import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/products/:id/stock — farmer updates stock allocation
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role !== "farmer") return jsonError("Only farmers can manage stock", 403);

    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return jsonError("Product not found", 404);

    if (product.farmer.toString() !== (user._id as unknown as string).toString()) {
      return jsonError("Not authorized to manage this product's stock", 403);
    }

    const { localStock, industrialStock } = await req.json();

    if (localStock !== undefined) product.localStock = localStock;
    if (industrialStock !== undefined) product.industrialStock = industrialStock;

    await product.save();
    return jsonSuccess(product, 200, "Stock updated");
  } catch (error: unknown) {
    console.error("Update stock error:", error);
    return jsonError("Server error", 500);
  }
}
