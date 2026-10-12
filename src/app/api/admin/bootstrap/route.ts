import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/admin/auth";

const schema = z.object({ setupKey: z.string().min(16), restaurantSlug: z.string().trim().min(1).max(100), first_name: z.string().trim().min(1).max(70), last_name: z.string().trim().min(1).max(70), email: z.string().trim().email().max(190), password: z.string().min(12).max(200) });
const permissionCatalog = [
  ["menu:read", "View menu", "View menu items and categories"], ["menu:write", "Manage menu", "Create and edit menu items"],
  ["categories:write", "Manage categories", "Create and edit menu categories"], ["orders:read", "View orders", "View customer orders"],
  ["orders:write", "Manage orders", "Update order status"], ["reservations:read", "View reservations", "View table bookings"],
  ["reservations:write", "Manage reservations", "Confirm or decline bookings"], ["settings:write", "Manage website", "Edit restaurant profile and homepage"],
  ["hours:write", "Manage opening hours", "Edit opening hours"], ["users:manage", "Manage team", "Create team accounts and assign roles"],
] as const;
const roleTemplates = [
  { name: "Owner", key: "owner", permissions: permissionCatalog.map(p => p[0]) },
  { name: "Manager", key: "manager", permissions: ["menu:read","menu:write","categories:write","orders:read","orders:write","reservations:read","reservations:write","settings:write","hours:write"] },
  { name: "Menu Editor", key: "menu_editor", permissions: ["menu:read","menu:write","categories:write","hours:write"] },
  { name: "Order & Booking Staff", key: "order_staff", permissions: ["menu:read","orders:read","orders:write","reservations:read","reservations:write"] },
];

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Provide a setup key, restaurant slug, first name, last name, valid email and a password of at least 12 characters." }, { status: 400 });
  const data = parsed.data; const expected = process.env.ADMIN_BOOTSTRAP_KEY;
  if (!expected || data.setupKey !== expected || expected.length < 16) return NextResponse.json({ error: "Bootstrap is not enabled or the setup key is invalid." }, { status: 403 });
  if (await prisma.user.count() > 0) return NextResponse.json({ error: "Bootstrap is closed because a user already exists." }, { status: 409 });
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: data.restaurantSlug }, select: { id: true } });
  if (!restaurant) return NextResponse.json({ error: "Restaurant slug not found. Create the restaurant first." }, { status: 404 });
  try { await prisma.$transaction(async tx => {
    if (await tx.user.count() > 0) throw new Error("BOOTSTRAP_CLOSED");
    for (const [key, name, description] of permissionCatalog) await tx.permission.upsert({ where: { key }, update: { name, description }, create: { key, name, description } });
    const user = await tx.user.create({ data: { email: data.email.toLowerCase(), firstName: data.first_name, lastName: data.last_name, passwordHash: hashPassword(data.password) } });
    let ownerId = "";
    for (const template of roleTemplates) {
      const role = await tx.restaurantRole.upsert({ where: { restaurantId_key: { restaurantId: restaurant.id, key: template.key } }, update: { name: template.name, isSystem: true }, create: { restaurantId: restaurant.id, name: template.name, key: template.key, isSystem: true } });
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      await tx.rolePermission.createMany({ data: template.permissions.map(permissionKey => ({ roleId: role.id, permissionKey })) });
      if (template.key === "owner") ownerId = role.id;
    }
    await tx.restaurantMembership.create({ data: { restaurantId: restaurant.id, userId: user.id, roleId: ownerId } });
  }); } catch (error) {
    if (error instanceof Error && error.message === "BOOTSTRAP_CLOSED") return NextResponse.json({ error: "Bootstrap is closed because a user already exists." }, { status: 409 });
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
    throw error;
  }
  return NextResponse.json({ ok: true, message: "Owner created. Sign in at /admin/login." }, { status: 201 });
}
