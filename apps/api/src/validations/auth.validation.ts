import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
    role: z.enum(["reviewer", "owner"]).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters").max(128)
  })
});

