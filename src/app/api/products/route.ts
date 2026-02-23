import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";

// GET /api/products — public listing with search, filter, pagination
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const organic = searchParams.get("organic") || "";
    const sort = searchParams.get("sort") || "-createdAt";
    const stockType = searchParams.get("stockType") || "";

    const query: Record<string, unknown> = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (organic === "true") query.isOrganic = true;
    if (stockType === "local") query.localStock = { $gt: 0 };
    if (stockType === "industrial") query.industrialStock = { $gt: 0 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("farmer", "name address")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return jsonSuccess({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Get products error:", error);
    return jsonError("Server error", 500);
  }
}

// POST /api/products — farmer creates a product
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);
    if (user.role !== "farmer") return jsonError("Only farmers can create products", 403);

    const body = await req.json();
    const product = await Product.create({ ...body, farmer: user._id });

    return jsonSuccess(product, 201, "Product created successfully");
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "ValidationError") return jsonError(err.message, 400);
    console.error("Create product error:", err);
    return jsonError("Server error", 500);
  }
}
