import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().min(1).default("Restaurant Platform"),
  DEFAULT_CURRENCY: z.string().length(3).default("KES"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  APP_NAME: process.env.APP_NAME ?? "Restaurant Platform",
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY ?? "KES",
});
