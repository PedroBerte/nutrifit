import { Request, Response } from "express";

import {
  createWorkoutTemplateSchema,
  finishWorkoutSessionSchema,
  startWorkoutSessionSchema,
  upsertWeeklyGoalSchema,
  updateSelfManagedProfileSchema,
  updateWorkoutTemplateSchema,
  weeklyProgressQuerySchema,
} from "./self-managed.schemas";
import {
  createSelfManagedWorkout,
  deleteSelfManagedWorkout,
  finishSelfManagedWorkoutSession,
  getSelfManagedWeeklyGoal,
  getSelfManagedWeeklyProgress,
  getSelfManagedProfile,
  getSelfManagedWorkoutSession,
  getSelfManagedWorkout,
  listSelfManagedWorkoutSessions,
  listSelfManagedWorkouts,
  startSelfManagedWorkoutSession,
  upsertSelfManagedWeeklyGoal,
  updateSelfManagedProfile,
  updateSelfManagedWorkout,
} from "./self-managed.service";

function getAuthenticatedUserId(request: Request) {
  return request.user!.id;
}

function getWorkoutIdParam(request: Request) {
  const { workoutId } = request.params;
  return Array.isArray(workoutId) ? workoutId[0] : workoutId;
}

function getSessionIdParam(request: Request) {
  const { sessionId } = request.params;
  return Array.isArray(sessionId) ? sessionId[0] : sessionId;
}

export async function getMyProfile(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const profile = await getSelfManagedProfile(userId);

  return response.status(200).json(profile);
}

export async function updateMyProfile(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const payload = updateSelfManagedProfileSchema.parse(request.body);
  const profile = await updateSelfManagedProfile(userId, payload);

  return response.status(200).json(profile);
}

export async function createMyWorkoutTemplate(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const payload = createWorkoutTemplateSchema.parse(request.body);
  const workout = await createSelfManagedWorkout(userId, payload);

  return response.status(201).json(workout);
}

export async function listMyWorkoutTemplates(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const workouts = await listSelfManagedWorkouts(userId);

  return response.status(200).json(workouts);
}

export async function getMyWorkoutTemplate(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const workout = await getSelfManagedWorkout(userId, getWorkoutIdParam(request));

  return response.status(200).json(workout);
}

export async function updateMyWorkoutTemplate(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const payload = updateWorkoutTemplateSchema.parse(request.body);
  const workout = await updateSelfManagedWorkout(userId, getWorkoutIdParam(request), payload);

  return response.status(200).json(workout);
}

export async function deleteMyWorkoutTemplate(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  await deleteSelfManagedWorkout(userId, getWorkoutIdParam(request));

  return response.status(204).send();
}

export async function startMyWorkoutSession(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const payload = startWorkoutSessionSchema.parse(request.body);
  const session = await startSelfManagedWorkoutSession(userId, payload);

  return response.status(201).json(session);
}

export async function listMyWorkoutSessions(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const sessions = await listSelfManagedWorkoutSessions(userId);

  return response.status(200).json(sessions);
}

export async function getMyWorkoutSession(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const session = await getSelfManagedWorkoutSession(userId, getSessionIdParam(request));

  return response.status(200).json(session);
}

export async function finishMyWorkoutSession(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const payload = finishWorkoutSessionSchema.parse(request.body);
  const session = await finishSelfManagedWorkoutSession(userId, getSessionIdParam(request), payload);

  return response.status(200).json(session);
}

export async function upsertMyWeeklyGoal(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const payload = upsertWeeklyGoalSchema.parse(request.body);
  const goal = await upsertSelfManagedWeeklyGoal(userId, payload);

  return response.status(200).json(goal);
}

export async function getMyWeeklyGoal(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const query = weeklyProgressQuerySchema.parse(request.query);
  const goal = await getSelfManagedWeeklyGoal(userId, query.weekStartDate);

  return response.status(200).json(goal);
}

export async function getMyWeeklyProgress(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);
  const query = weeklyProgressQuerySchema.parse(request.query);
  const progress = await getSelfManagedWeeklyProgress(userId, query.weekStartDate);

  return response.status(200).json(progress);
}
