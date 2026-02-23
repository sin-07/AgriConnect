import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import UserModel, { IUser } from "@/models/User";
import connectDB from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "agriconnect_default_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

interface JwtPayload {
  id: string;
  role: string;
}

export function generateToken(id: string, role: string): string {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function getAuthUser(req: NextRequest): Promise<IUser | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    await connectDB();
    const user = await UserModel.findById(decoded.id);
    return user;
  } catch {
    return null;
  }
}

export function jsonError(message: string, status: number) {
  return Response.json({ success: false, message }, { status });
}

export function jsonSuccess(data: unknown, status = 200, message?: string) {
  return Response.json({ success: true, ...(message && { message }), data }, { status });
}
