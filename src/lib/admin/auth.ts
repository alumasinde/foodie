import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE = "foodie_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;
const secret = () => process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "local-development-secret-change-before-deploy" : "");

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}
export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  try {
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}
function sign(value: string) { const key = secret(); if (!key) throw new Error("SESSION_SECRET must be configured in production."); return createHmac("sha256", key).update(value).digest("base64url"); }
export function createSession(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
function readSession(token?: string) {
  if (!token || !secret()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload)); const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try { const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId: string; exp: number }; return data.exp > Date.now() / 1000 ? data : null; } catch { return null; }
}
export async function setSessionCookie(userId: string) {
  (await cookies()).set(COOKIE, createSession(userId), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
}
export async function clearSessionCookie() { (await cookies()).delete(COOKIE); }
export async function currentUser() {
  const jar = await cookies(); const session = readSession(jar.get(COOKIE)?.value);
  if (!session) return null;
  return prisma.user.findFirst({ where: { id: session.userId, isActive: true }, select: { id: true, email: true, firstName: true, lastName: true } });
}
export async function authorize(slug: string, permission: string) {
  const user = await currentUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  const membership = await prisma.restaurantMembership.findFirst({
    where: { userId: user.id, isActive: true, restaurant: { slug }, role: { restaurant: { slug } } },
    include: { role: true, restaurant: { select: { id: true, slug: true, name: true } } },
  });
  if (!membership) return { error: NextResponse.json({ error: "You do not have access to this restaurant." }, { status: 403 }) };
  let permissions: string[] = [];
  try { permissions = JSON.parse(membership.role.permissions) as string[]; } catch { /* deny on invalid role data */ }
  if (!permissions.includes("*") && !permissions.includes(permission)) return { error: NextResponse.json({ error: "Your role does not permit this action." }, { status: 403 }) };
  return { user, membership };
}
