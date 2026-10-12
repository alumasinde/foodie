import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authorize, hashPassword } from "@/lib/admin/auth";

const roleInclude = { rolePermissions: { include: { permission: { select: { key: true, name: true } } } } } as const;
const permissionsFor = (role: { rolePermissions: { permission: { key: string; name: string } }[] }) => role.rolePermissions.map(rp => rp.permission.key);

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const auth = await authorize(slug, "users:manage"); if (auth.error) return auth.error;
  const [memberships, roles] = await Promise.all([
    prisma.restaurantMembership.findMany({ where: { restaurantId: auth.membership.restaurantId }, include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true, lastLoginAt: true } }, role: { include: roleInclude } }, orderBy: { createdAt: "asc" } }),
    prisma.restaurantRole.findMany({ where: { restaurantId: auth.membership.restaurantId }, include: roleInclude, orderBy: { createdAt: "asc" } }),
  ]);
  return NextResponse.json({ memberships: memberships.map(m => ({ ...m, role: { ...m.role, permissions: permissionsFor(m.role) } })), roles: roles.map(r => ({ ...r, permissions: permissionsFor(r) })) });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const auth = await authorize(slug, "users:manage"); if (auth.error) return auth.error;
  const parsed = z.object({ first_name: z.string().trim().min(1).max(70), last_name: z.string().trim().min(1).max(70), email: z.string().trim().email().max(190), password: z.string().min(12).max(200), roleId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter first and last name, a valid email, password of at least 12 characters and role." }, { status: 400 });
  const data = parsed.data; const role = await prisma.restaurantRole.findFirst({ where: { id: data.roleId, restaurantId: auth.membership.restaurantId }, include: roleInclude });
  if (!role) return NextResponse.json({ error: "Role not found for this restaurant." }, { status: 400 });
  const email = data.email.toLowerCase(); if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  try { const membership = await prisma.$transaction(async tx => { const user = await tx.user.create({ data: { firstName: data.first_name, lastName: data.last_name, email, passwordHash: hashPassword(data.password) } }); return tx.restaurantMembership.create({ data: { restaurantId: auth.membership.restaurantId, userId: user.id, roleId: role.id }, include: { role: { include: roleInclude }, user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } } } }); });
    return NextResponse.json({ membership: { ...membership, role: { ...membership.role, permissions: permissionsFor(membership.role) } } }, { status: 201 });
  } catch (error) { if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 }); throw error; }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const auth = await authorize(slug, "users:manage"); if (auth.error) return auth.error;
  const parsed = z.object({ membershipId: z.string(), isActive: z.boolean(), roleId: z.string().optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid membership update." }, { status: 400 }); const data = parsed.data;
  if (data.membershipId === auth.membership.id && !data.isActive) return NextResponse.json({ error: "You cannot deactivate your own access." }, { status: 400 });
  const target = await prisma.restaurantMembership.findFirst({ where: { id: data.membershipId, restaurantId: auth.membership.restaurantId } }); if (!target) return NextResponse.json({ error: "Team member not found." }, { status: 404 });
  if (data.roleId && !await prisma.restaurantRole.findFirst({ where: { id: data.roleId, restaurantId: auth.membership.restaurantId } })) return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  const membership = await prisma.restaurantMembership.update({ where: { id: target.id }, data: { isActive: data.isActive, ...(data.roleId ? { roleId: data.roleId } : {}) } }); return NextResponse.json({ membership });
}
