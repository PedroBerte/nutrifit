import { AppError } from "../../common/app-error";
import {
  createSelfManagedUser,
  deleteWorkoutTemplate,
  finishWorkoutSession,
  getCurrentWeekStartDate,
  getWorkoutSessionById,
  getWeeklyGoal,
  getWeeklyGoalProgress,
  listWorkoutSessionsByUser,
  startWorkoutSession,
  upsertWeeklyGoal,
  createWorkoutTemplate,
  findUserById,
  getWorkoutTemplateById,
  listWorkoutTemplatesByUser,
  updateSelfManagedUser,
  updateWorkoutTemplate,
} from "./self-managed.store";

export async function registerSelfManagedUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return createSelfManagedUser(input);
}

export async function getSelfManagedProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateSelfManagedProfile(userId: string, changes: { name: string }) {
  const user = await updateSelfManagedUser(userId, changes);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function createSelfManagedWorkout(
  userId: string,
  payload: { title: string; notes?: string; exercises: Array<{ name: string; sets: number; reps: number }> }
) {
  return createWorkoutTemplate({ userId, ...payload });
}

export async function listSelfManagedWorkouts(userId: string) {
  return listWorkoutTemplatesByUser(userId);
}

export async function getSelfManagedWorkout(userId: string, workoutId: string) {
  return getWorkoutTemplateById(userId, workoutId);
}

export async function updateSelfManagedWorkout(
  userId: string,
  workoutId: string,
  payload: { title?: string; notes?: string; exercises?: Array<{ name: string; sets: number; reps: number }> }
) {
  return updateWorkoutTemplate(userId, workoutId, payload);
}

export async function deleteSelfManagedWorkout(userId: string, workoutId: string) {
  await deleteWorkoutTemplate(userId, workoutId);
}

export async function startSelfManagedWorkoutSession(
  userId: string,
  payload: { workoutTemplateId: string; notes?: string }
) {
  return startWorkoutSession({ userId, ...payload });
}

export async function listSelfManagedWorkoutSessions(userId: string) {
  return listWorkoutSessionsByUser(userId);
}

export async function getSelfManagedWorkoutSession(userId: string, sessionId: string) {
  return getWorkoutSessionById(userId, sessionId);
}

export async function finishSelfManagedWorkoutSession(
  userId: string,
  sessionId: string,
  payload: { notes?: string; exercises: Array<{ name: string; completedSets: number; completedReps: number }> }
) {
  return finishWorkoutSession(userId, sessionId, payload);
}

export async function upsertSelfManagedWeeklyGoal(
  userId: string,
  payload: { targetSessions: number; weekStartDate?: string }
) {
  return upsertWeeklyGoal({ userId, ...payload });
}

export async function getSelfManagedWeeklyGoal(userId: string, weekStartDate?: string) {
  const goal = await getWeeklyGoal(userId, weekStartDate);
  if (!goal) {
    return {
      weekStartDate: weekStartDate ?? getCurrentWeekStartDate(),
      targetSessions: 0,
    };
  }

  return {
    weekStartDate: goal.weekStartDate,
    targetSessions: goal.targetSessions,
  };
}

export async function getSelfManagedWeeklyProgress(userId: string, weekStartDate?: string) {
  return getWeeklyGoalProgress(userId, weekStartDate);
}
