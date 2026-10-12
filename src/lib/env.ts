import { z } from "zod";

// Public/app settings. Safe to import from layouts and pages: nothing here
// requires the database, so `next build` works without DATABASE_URL.
const appEnvSchema = z.object({
  APP_URL: z.url().default("http://localhost:3000"),
  APP_NAME: z.string().min(1).default("Restaurant Platform"),
  DEFAULT_CURRENCY: z.string().length(3).default("KES"),
});

const blankToUndefined = (value: string | undefined) =>
  value === undefined || value.trim() === "" ? undefined : value;

export const env = appEnvSchema.parse({
  APP_URL: blankToUndefined(process.env.APP_URL),
  APP_NAME: blankToUndefined(process.env.APP_NAME),
  DEFAULT_CURRENCY: blankToUndefined(process.env.DEFAULT_CURRENCY),
});

// Server-only database settings. Import this only from code that talks to the
// database (e.g. src/lib/prisma.ts), never from layouts.
export function getDatabaseUrl(): string {
  return z
    .string()
    .min(1, "DATABASE_URL is required")
    .parse(process.env.DATABASE_URL);
}
