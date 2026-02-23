import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken, jsonError, jsonSuccess } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, role, phone, address } = body;

    if (!name || !email || !password || !role) {
      return jsonError("Please provide name, email, password, and role", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return jsonError("User already exists with this email", 400);
    }

    const user = await User.create({ name, email, password, role, phone, address });

    const token = generateToken(
      (user._id as unknown as string),
      user.role
    );

    // Send welcome email (fire-and-forget — don't block the response)
    sendWelcomeEmail({ name: user.name, email: user.email, role: user.role }).catch(
      (err) => console.error("Welcome email error:", err)
    );

    return jsonSuccess(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
        },
        token,
      },
      201,
      "Registration successful"
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === "ValidationError") {
      return jsonError(err.message, 400);
    }
    console.error("Register error:", err);
    return jsonError("Server error", 500);
  }
}
