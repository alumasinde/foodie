import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; reference: string }> }) {
  const { slug, reference } = await params;
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: slug.toLowerCase(), isPublished: true }, select: { id: true } });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  const order = await prisma.customerOrder.findFirst({
    where: { restaurantId: restaurant.id, reference: reference.toUpperCase() },
    select: { reference: true, status: true, orderType: true, subtotal: true, createdAt: true, updatedAt: true, items: { select: { itemName: true, quantity: true, lineTotal: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found. Check the reference and try again." }, { status: 404 });
  return NextResponse.json({ order: { ...order, subtotal: order.subtotal.toString(), items: order.items.map((item) => ({ ...item, lineTotal: item.lineTotal.toString() })) } });
}
