import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getAuthUser, jsonError, jsonSuccess } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return jsonError("Not authorized", 401);

    return jsonSuccess({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error: unknown) {
    console.error("Get me error:", error);
    return jsonError("Server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const authUser = await getAuthUser(req);
    if (!authUser) return jsonError("Not authorized", 401);

    const body = await req.json();
    const { name, phone, address } = body;

    const user = await User.findByIdAndUpdate(
      authUser._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    return jsonSuccess({
      user: {
        id: user!._id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
        phone: user!.phone,
        address: user!.address,
      },
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return jsonError("Server error", 500);
  }
}
