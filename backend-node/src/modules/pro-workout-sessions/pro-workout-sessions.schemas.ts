import { z } from "zod";

export const startSessionSchema = z.object({
  workoutTemplateId: z.uuid(),
  routineId: z.uuid(),
  notes: z.string().optional(),
});

export const finishSessionSchema = z.object({
  notes: z.string().optional(),
  difficultyRating: z.number().int().min(1).max(5).optional(),
  energyRating: z.number().int().min(1).max(5).optional(),
  exercises: z.array(z.object({
    exerciseTemplateId: z.uuid(),
    sets: z.array(z.object({
      setNumber: z.number().int().positive(),
      load: z.number().nonnegative().optional(),
      reps: z.number().int().nonnegative().optional(),
      restSeconds: z.number().int().nonnegative().optional(),
      completed: z.boolean().optional().default(true),
      notes: z.string().optional(),
    })),
  })).optional(),
});
