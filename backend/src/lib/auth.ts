import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { HydratedDocument } from "mongoose";
import { NextRequest } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { User, type IUser } from "@/models/User";
import { unauthorized } from "@/lib/api-response";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export type AuthContext = {
  user: HydratedDocument<IUser>;
  userId: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
}

export function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export async function requireAuth(request: NextRequest): Promise<AuthContext | Response> {
  const token = getBearerToken(request);
  if (!token) return unauthorized();

  try {
    const payload = verifyToken(token);
    await connectDb();
    const user = await User.findById(payload.sub);
    if (!user) return unauthorized("User not found");
    return { user, userId: user._id.toString() };
  } catch {
    return unauthorized("Invalid or expired token");
  }
}

export async function requireAdmin(request: NextRequest): Promise<AuthContext | Response> {
  const auth = await requireAuth(request);
  if (auth instanceof Response) return auth;
  if (!auth.user.roles.includes("admin")) return unauthorized("Admins only");
  return auth;
}

export function sanitizeUser(user: HydratedDocument<IUser>) {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    panNumber: user.panNumber,
    planId: user.planId,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionStartedAt: user.subscriptionStartedAt,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
    roles: user.roles,
    createdAt: user.createdAt,
  };
}
