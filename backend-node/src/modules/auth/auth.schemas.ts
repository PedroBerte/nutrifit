import { z } from "zod";

export const registerSelfManagedSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  password: z.string().min(8).max(64),
});

export const loginSelfManagedSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64),
});
