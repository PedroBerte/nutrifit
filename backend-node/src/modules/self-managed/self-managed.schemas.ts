import { z } from "zod";

export const updateSelfManagedProfileSchema = z.object({
  name: z.string().min(2).max(120),
});

const workoutExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100),
});

export const createWorkoutTemplateSchema = z.object({
  title: z.string().min(2).max(120),
  notes: z.string().max(500).optional(),
  exercises: z.array(workoutExerciseSchema).min(1).max(30),
});

export const updateWorkoutTemplateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  notes: z.string().max(500).optional(),
  exercises: z.array(workoutExerciseSchema).min(1).max(30).optional(),
});

export const startWorkoutSessionSchema = z.object({
  workoutTemplateId: z.uuid(),
  notes: z.string().max(500).optional(),
});

const finishWorkoutSessionExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  completedSets: z.number().int().min(0).max(20),
  completedReps: z.number().int().min(0).max(200),
});

export const finishWorkoutSessionSchema = z.object({
  notes: z.string().max(500).optional(),
  exercises: z.array(finishWorkoutSessionExerciseSchema).min(1).max(30),
});

export const upsertWeeklyGoalSchema = z.object({
  targetSessions: z.number().int().min(1).max(14),
  weekStartDate: z.iso.date().optional(),
});

export const weeklyProgressQuerySchema = z.object({
  weekStartDate: z.iso.date().optional(),
});
