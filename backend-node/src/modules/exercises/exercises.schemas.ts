import { z } from "zod";

export const createExerciseSchema = z.object({
  categoryId: z.uuid(),
  name: z.string().min(1),
  instruction: z.string().optional(),
  imageUrl: z.url().optional(),
  videoUrl: z.url().optional(),
  isPublished: z.boolean().optional().default(false),
  primaryMuscleIds: z.array(z.uuid()).optional(),
  secondaryMuscleIds: z.array(z.uuid()).optional(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const updateExerciseMediaSchema = z.object({
  imageUrl: z.url().optional(),
  videoUrl: z.url().optional(),
});
