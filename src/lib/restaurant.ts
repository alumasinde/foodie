import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Resolve a published tenant only by its public slug. Never fall back to another restaurant. */
export const getPublishedRestaurantBySlug = cache(async (slug: string) => {
  return prisma.restaurant.findFirst({
    where: { slug: slug.toLowerCase(), isPublished: true },
    include: {
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      diningAreas: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      menuCategories: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          items: {
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          },
        },
      },
    },
  });
});

export const weekdayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

export function normalizePhoneForWhatsApp(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 ? digits : null;
}
