import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(7).max(30),
  orderType: z.enum(["pickup", "delivery", "dine_in"]),
  deliveryAddress: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
  items: z.array(z.object({ menuItemId: z.string().min(1).max(30), quantity: z.number().int().min(1).max(50) })).min(1).max(40),
});

function makeReference(prefix: string) {
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: slug.toLowerCase(), isPublished: true }, select: { id: true, name: true } });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });

  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your details and cart, then try again." }, { status: 400 });
  const data = parsed.data;
  if (data.orderType === "delivery" && data.deliveryAddress.length < 5) {
    return NextResponse.json({ error: "Please enter a delivery address." }, { status: 400 });
  }

  const ids = [...new Set(data.items.map((item) => item.menuItemId))];
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: ids }, restaurantId: restaurant.id, isAvailable: true }, select: { id: true, name: true, price: true } });
  if (menuItems.length !== ids.length) return NextResponse.json({ error: "One or more items are unavailable. Refresh the menu and try again." }, { status: 409 });

  const itemMap = new Map(menuItems.map((item) => [item.id, item]));
  const lineItems = data.items.map((line) => {
    const item = itemMap.get(line.menuItemId)!;
    const unitPrice = Number(item.price);
    return { menuItemId: item.id, itemName: item.name, unitPrice, quantity: line.quantity, lineTotal: unitPrice * line.quantity };
  });
  const subtotal = lineItems.reduce((sum, line) => sum + line.lineTotal, 0);
  const reference = makeReference("FD");

  const order = await prisma.customerOrder.create({
    data: {
      reference, restaurantId: restaurant.id, customerName: data.customerName, customerPhone: data.customerPhone,
      orderType: data.orderType, deliveryAddress: data.orderType === "delivery" ? data.deliveryAddress : null,
      notes: data.notes || null, subtotal: subtotal.toFixed(2),
      items: { create: lineItems.map((line) => ({ ...line, unitPrice: line.unitPrice.toFixed(2), lineTotal: line.lineTotal.toFixed(2) })) },
    },
    select: { reference: true, status: true, subtotal: true, createdAt: true },
  });
  return NextResponse.json({ order: { ...order, subtotal: order.subtotal.toString(), createdAt: order.createdAt.toISOString() } }, { status: 201 });
}
