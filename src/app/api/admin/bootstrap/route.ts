import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/admin/auth";
const schema = z.object({ setupKey: z.string().min(16), restaurantSlug: z.string().trim().min(1).max(100), first_name: z.string().trim().min(1).max(70), last_name: z.string().trim().min(1).max(70), email: z.string().trim().email().max(190), password: z.string().min(12).max(200) });
const allPermissions = ["menu:read","menu:write","categories:write","orders:read","orders:write","reservations:read","reservations:write","settings:write","hours:write","users:manage"];
const roles = [
  { name: "Owner", key: "owner", permissions: allPermissions, isSystem: true },
  { name: "Manager", key: "manager", permissions: ["menu:read","menu:write","categories:write","orders:read","orders:write","reservations:read","reservations:write","settings:write","hours:write"], isSystem: true },
  { name: "Menu Editor", key: "menu_editor", permissions: ["menu:read","menu:write","categories:write","hours:write"], isSystem: true },
  { name: "Order & Booking Staff", key: "order_staff", permissions: ["menu:read","orders:read","orders:write","reservations:read","reservations:write"], isSystem: true },
];
export async function POST(request: Request) {
  const data = schema.safeParse(await request.json().catch(() => null));
  if (!data.success) return NextResponse.json({ error: "Provide a setup key, restaurant slug, first name, last name, valid email and a password of at least 12 characters." }, { status: 400 });
  const expected = process.env.ADMIN_BOOTSTRAP_KEY;
  if (!expected || data.data.setupKey !== expected || expected.length < 16) return NextResponse.json({ error: "Bootstrap is not enabled or the setup key is invalid." }, { status: 403 });
  if (await prisma.user.count() > 0) return NextResponse.json({ error: "Bootstrap is closed because a user already exists." }, { status: 409 });
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: data.data.restaurantSlug }, select: { id: true } });
  if (!restaurant) return NextResponse.json({ error: "Restaurant slug not found. Create the restaurant first." }, { status: 404 });
  try {
    await prisma.$transaction(async tx => {
      if (await tx.user.count() > 0) throw new Error("BOOTSTRAP_CLOSED");
      const user = await tx.user.create({ data: { email: data.data.email.toLowerCase(), firstName: data.data.first_name, lastName: data.data.last_name, passwordHash: hashPassword(data.data.password) } });
      const created = [];
      for (const role of roles) created.push(await tx.restaurantRole.create({ data: { restaurantId: restaurant.id, name: role.name, key: role.key, permissions: JSON.stringify(role.permissions), isSystem: role.isSystem } }));
      const owner = created.find(role => role.key === "owner")!;
      await tx.restaurantMembership.create({ data: { restaurantId: restaurant.id, userId: user.id, roleId: owner.id } });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BOOTSTRAP_CLOSED") return NextResponse.json({ error: "Bootstrap is closed because a user already exists." }, { status: 409 });
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
    throw error;
  }
  return NextResponse.json({ ok: true, message: "Owner created. Sign in at /admin/login." }, { status: 201 });
}
