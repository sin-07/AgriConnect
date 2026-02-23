import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken, jsonError, jsonSuccess } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonError("Please provide email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return jsonError("Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return jsonError("Invalid credentials", 401);
    }

    const token = generateToken(
      (user._id as unknown as string),
      user.role
    );

    return jsonSuccess({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return jsonError("Server error", 500);
  }
}
