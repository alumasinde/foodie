import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const reservationSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(7).max(30),
  guestCount: z.number().int().min(1).max(30),
  reservationDate: z.string().datetime({ offset: true }),
  diningAreaId: z.string().max(30).optional().nullable(),
  notes: z.string().trim().max(500).optional().default(""),
});

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: slug.toLowerCase(), isPublished: true }, select: { id: true } });
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  const parsed = reservationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your reservation details." }, { status: 400 });
  const data = parsed.data;
  const date = new Date(data.reservationDate);
  if (date.getTime() < Date.now() + 30 * 60 * 1000) return NextResponse.json({ error: "Choose a time at least 30 minutes from now." }, { status: 400 });
  if (data.diningAreaId) {
    const area = await prisma.diningArea.findFirst({ where: { id: data.diningAreaId, restaurantId: restaurant.id, isActive: true }, select: { capacity: true } });
    if (!area) return NextResponse.json({ error: "Please choose an available dining area." }, { status: 400 });
    if (area.capacity && data.guestCount > area.capacity) return NextResponse.json({ error: `This dining area accommodates up to ${area.capacity} guests. Choose another area or reduce the guest count.` }, { status: 400 });
  }
  const reference = `RS-${randomBytes(4).toString("hex").toUpperCase()}`;
  const reservation = await prisma.tableReservation.create({ data: {
    reference, restaurantId: restaurant.id, diningAreaId: data.diningAreaId || null,
    customerName: data.customerName, customerPhone: data.customerPhone, guestCount: data.guestCount,
    reservationDate: date, notes: data.notes || null,
  }, select: { reference: true, status: true, reservationDate: true } });
  return NextResponse.json({ reservation: { ...reservation, reservationDate: reservation.reservationDate.toISOString() } }, { status: 201 });
}
