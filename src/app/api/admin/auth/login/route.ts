import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/admin/auth";
const schema = z.object({ email: z.string().trim().email().max(190), password: z.string().min(1).max(200) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.passwordHash)) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  const membership = await prisma.restaurantMembership.findFirst({ where: { userId: user.id, isActive: true } });
  if (!membership) return NextResponse.json({ error: "This account has no active restaurant access. Contact the restaurant owner." }, { status: 403 });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true, restaurantId: membership.restaurantId });
}
