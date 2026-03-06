import { z } from "zod";

export const createTemplateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const addExerciseSchema = z.object({
  exerciseId: z.uuid(),
  order: z.number().int().nonnegative().optional().default(0),
  targetSets: z.number().int().positive(),
  targetRepsMin: z.number().int().positive().optional(),
  targetRepsMax: z.number().int().positive().optional(),
  suggestedLoad: z.number().positive().optional(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  setType: z.string().optional().default("Reps"),
  weightUnit: z.string().optional().default("kg"),
  isBisetWithPrevious: z.boolean().optional().default(false),
  targetDurationSeconds: z.number().int().nonnegative().optional(),
  targetCalories: z.number().nonnegative().optional(),
});

export const updateExerciseTemplateSchema = addExerciseSchema.partial();

export const reorderSchema = z.array(z.uuid());
