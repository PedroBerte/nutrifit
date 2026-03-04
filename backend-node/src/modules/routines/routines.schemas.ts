import { z } from "zod";

export const createRoutineSchema = z.object({
  title: z.string().min(1),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
  weeks: z.number().int().positive().optional(),
});

export const updateRoutineSchema = createRoutineSchema.partial();

export const assignRoutineSchema = z.object({
  routineId: z.uuid(),
  customerId: z.uuid(),
  expiresAt: z.iso.datetime().optional(),
});

export const updateExpirySchema = z.object({
  expiresAt: z.iso.datetime().nullable(),
});
