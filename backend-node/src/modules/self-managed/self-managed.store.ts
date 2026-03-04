import { AppError } from "../../common/app-error";
import { prisma } from "../../prisma";

export interface SelfManagedUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  profile: "SelfManaged";
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExerciseInput {
  name: string;
  sets: number;
  reps: number;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  exercises: WorkoutExerciseInput[];
  createdAt: string;
  updatedAt: string;
}

export type WorkoutSessionStatus = "in_progress" | "finished";

export interface WorkoutSessionExerciseLog {
  name: string;
  plannedSets: number;
  plannedReps: number;
  completedSets: number;
  completedReps: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutTemplateId: string;
  titleSnapshot: string;
  status: WorkoutSessionStatus;
  startedAt: string;
  finishedAt?: string;
  notes?: string;
  exercises: WorkoutSessionExerciseLog[];
}

export interface WeeklyGoal {
  id: string;
  userId: string;
  weekStartDate: string;
  targetSessions: number;
  createdAt: string;
  updatedAt: string;
}

// Fixed profile ID for SelfManaged users (seeded in DB)
const SELF_MANAGED_PROFILE_ID =
  process.env.SELF_MANAGED_PROFILE_ID ?? "00000000-0000-0000-0000-000000000004";

function normalizeWeekStartDate(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const distanceToMonday = day === 0 ? 6 : day - 1;
  utc.setUTCDate(utc.getUTCDate() - distanceToMonday);
  return utc.toISOString().slice(0, 10);
}

export function getCurrentWeekStartDate(): string {
  return normalizeWeekStartDate(new Date());
}

function toSelfManagedUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}): SelfManagedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash ?? "",
    isAdmin: user.isAdmin,
    profile: "SelfManaged",
    createdAt: user.createdAt.toISOString(),
    updatedAt: (user.updatedAt ?? user.createdAt).toISOString(),
  };
}

export async function resetSelfManagedStore(): Promise<void> {
  await prisma.weeklyGoal.deleteMany();
  await prisma.workoutSession.deleteMany({ where: { userId: { not: null } } });
  await prisma.workoutTemplate.deleteMany({ where: { userId: { not: null } } });
  await prisma.user.deleteMany({ where: { profileId: SELF_MANAGED_PROFILE_ID } });
}

export async function createSelfManagedUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<SelfManagedUser> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  // Ensure SelfManaged profile exists
  await prisma.profile.upsert({
    where: { id: SELF_MANAGED_PROFILE_ID },
    update: {},
    create: { id: SELF_MANAGED_PROFILE_ID, name: "SelfManaged", status: "A" },
  });

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash: input.passwordHash,
      profileId: SELF_MANAGED_PROFILE_ID,
      isAdmin: false,
      status: "A",
      sex: "",
      phoneNumber: "",
    },
  });

  return toSelfManagedUser(user);
}

export async function findUserByEmail(email: string): Promise<SelfManagedUser | undefined> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  return user ? toSelfManagedUser(user) : undefined;
}

export async function findUserById(id: string): Promise<SelfManagedUser | undefined> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toSelfManagedUser(user) : undefined;
}

export async function updateSelfManagedUser(
  userId: string,
  changes: { name?: string }
): Promise<SelfManagedUser> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new AppError("User not found", 404);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: changes.name?.trim() ?? existing.name },
  });

  return toSelfManagedUser(user);
}

// --- WorkoutTemplate ---
// Exercises are stored as JSON in the `description` field.

function toWorkoutTemplate(row: {
  id: string;
  userId: string | null;
  title: string;
  notes: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}): WorkoutTemplate {
  let exercises: WorkoutExerciseInput[] = [];
  try {
    const parsed = JSON.parse(row.description ?? "[]");
    if (Array.isArray(parsed)) exercises = parsed as WorkoutExerciseInput[];
  } catch {
    exercises = [];
  }

  return {
    id: row.id,
    userId: row.userId ?? "",
    title: row.title,
    notes: row.notes ?? undefined,
    exercises,
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
  };
}

export async function createWorkoutTemplate(input: {
  userId: string;
  title: string;
  notes?: string;
  exercises: WorkoutExerciseInput[];
}): Promise<WorkoutTemplate> {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new AppError("User not found", 404);

  const row = await prisma.workoutTemplate.create({
    data: {
      userId: input.userId,
      title: input.title.trim(),
      notes: input.notes?.trim(),
      description: JSON.stringify(input.exercises),
      status: "A",
    },
  });

  return toWorkoutTemplate(row);
}

export async function listWorkoutTemplatesByUser(userId: string): Promise<WorkoutTemplate[]> {
  const rows = await prisma.workoutTemplate.findMany({ where: { userId, status: "A" } });
  return rows.map(toWorkoutTemplate);
}

export async function getWorkoutTemplateById(
  userId: string,
  workoutId: string
): Promise<WorkoutTemplate> {
  const row = await prisma.workoutTemplate.findFirst({ where: { id: workoutId, userId } });
  if (!row) throw new AppError("Workout template not found", 404);
  return toWorkoutTemplate(row);
}

export async function updateWorkoutTemplate(
  userId: string,
  workoutId: string,
  changes: { title?: string; notes?: string; exercises?: WorkoutExerciseInput[] }
): Promise<WorkoutTemplate> {
  const existing = await getWorkoutTemplateById(userId, workoutId);
  const updatedExercises = changes.exercises ?? existing.exercises;

  const row = await prisma.workoutTemplate.update({
    where: { id: workoutId },
    data: {
      title: changes.title?.trim() ?? existing.title,
      notes: changes.notes?.trim() ?? existing.notes,
      description: JSON.stringify(updatedExercises),
    },
  });

  return toWorkoutTemplate(row);
}

export async function deleteWorkoutTemplate(userId: string, workoutId: string): Promise<void> {
  await getWorkoutTemplateById(userId, workoutId);
  await prisma.workoutTemplate.delete({ where: { id: workoutId } });
}

// --- WorkoutSession ---
// Exercises are stored as JSON in the `notes` field to avoid complex Exercise entity relations
// for self-managed users. Format: JSON object { exercises: [...], userNotes: "..." }

function packSessionData(
  exercises: WorkoutSessionExerciseLog[],
  userNotes?: string
): string {
  return JSON.stringify({ exercises, userNotes: userNotes ?? null });
}

function unpackSessionData(raw: string | null): {
  exercises: WorkoutSessionExerciseLog[];
  userNotes?: string;
} {
  if (!raw) return { exercises: [] };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.exercises)) {
      return { exercises: parsed.exercises, userNotes: parsed.userNotes ?? undefined };
    }
  } catch {
    // fall through
  }
  return { exercises: [], userNotes: raw || undefined };
}

export async function startWorkoutSession(input: {
  userId: string;
  workoutTemplateId: string;
  notes?: string;
}): Promise<WorkoutSession> {
  const template = await getWorkoutTemplateById(input.userId, input.workoutTemplateId);

  const initialExercises: WorkoutSessionExerciseLog[] = template.exercises.map((ex) => ({
    name: ex.name,
    plannedSets: ex.sets,
    plannedReps: ex.reps,
    completedSets: 0,
    completedReps: 0,
  }));

  const row = await prisma.workoutSession.create({
    data: {
      userId: input.userId,
      workoutTemplateId: input.workoutTemplateId,
      titleSnapshot: template.title,
      status: "in_progress",
      notes: packSessionData(initialExercises, input.notes),
    },
  });

  return {
    id: row.id,
    userId: row.userId ?? "",
    workoutTemplateId: row.workoutTemplateId ?? "",
    titleSnapshot: row.titleSnapshot ?? "",
    status: "in_progress",
    startedAt: row.startedAt.toISOString(),
    finishedAt: undefined,
    notes: input.notes,
    exercises: initialExercises,
  };
}

export async function listWorkoutSessionsByUser(userId: string): Promise<WorkoutSession[]> {
  const rows = await prisma.workoutSession.findMany({ where: { userId } });
  return rows.map((row) => {
    const { exercises, userNotes } = unpackSessionData(row.notes);
    return {
      id: row.id,
      userId: row.userId ?? "",
      workoutTemplateId: row.workoutTemplateId ?? "",
      titleSnapshot: row.titleSnapshot ?? "",
      status: (row.status === "finished" ? "finished" : "in_progress") as WorkoutSessionStatus,
      startedAt: row.startedAt.toISOString(),
      finishedAt: row.finishedAt?.toISOString(),
      notes: userNotes,
      exercises,
    };
  });
}

export async function getWorkoutSessionById(
  userId: string,
  sessionId: string
): Promise<WorkoutSession> {
  const row = await prisma.workoutSession.findFirst({ where: { id: sessionId, userId } });
  if (!row) throw new AppError("Workout session not found", 404);
  const { exercises, userNotes } = unpackSessionData(row.notes);
  return {
    id: row.id,
    userId: row.userId ?? "",
    workoutTemplateId: row.workoutTemplateId ?? "",
    titleSnapshot: row.titleSnapshot ?? "",
    status: (row.status === "finished" ? "finished" : "in_progress") as WorkoutSessionStatus,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString(),
    notes: userNotes,
    exercises,
  };
}

export async function finishWorkoutSession(
  userId: string,
  sessionId: string,
  input: {
    notes?: string;
    exercises: Array<{ name: string; completedSets: number; completedReps: number }>;
  }
): Promise<WorkoutSession> {
  const existing = await getWorkoutSessionById(userId, sessionId);
  if (existing.status === "finished") throw new AppError("Workout session already finished", 409);

  const completedByName = new Map(
    input.exercises.map((item) => [item.name.trim().toLowerCase(), item])
  );
  const updatedExercises = existing.exercises.map((exercise) => {
    const found = completedByName.get(exercise.name.trim().toLowerCase());
    if (!found) return exercise;
    return { ...exercise, completedSets: found.completedSets, completedReps: found.completedReps };
  });

  const userNotes = input.notes?.trim() ?? existing.notes;

  const updated = await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: "finished",
      finishedAt: new Date(),
      notes: packSessionData(updatedExercises, userNotes),
    },
  });

  return {
    id: updated.id,
    userId: updated.userId ?? "",
    workoutTemplateId: updated.workoutTemplateId ?? "",
    titleSnapshot: updated.titleSnapshot ?? "",
    status: "finished",
    startedAt: updated.startedAt.toISOString(),
    finishedAt: updated.finishedAt?.toISOString(),
    notes: userNotes,
    exercises: updatedExercises,
  };
}

// --- WeeklyGoal ---

export async function upsertWeeklyGoal(input: {
  userId: string;
  targetSessions: number;
  weekStartDate?: string;
}): Promise<WeeklyGoal> {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new AppError("User not found", 404);

  const weekStartDate = input.weekStartDate ?? getCurrentWeekStartDate();

  const row = await prisma.weeklyGoal.upsert({
    where: { userId_weekStartDate: { userId: input.userId, weekStartDate } },
    update: { targetSessions: input.targetSessions },
    create: { userId: input.userId, weekStartDate, targetSessions: input.targetSessions },
  });

  return {
    id: row.id,
    userId: row.userId,
    weekStartDate: row.weekStartDate,
    targetSessions: row.targetSessions,
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
  };
}

export async function getWeeklyGoal(
  userId: string,
  weekStartDate?: string
): Promise<WeeklyGoal | undefined> {
  const normalizedWeek = weekStartDate ?? getCurrentWeekStartDate();
  const row = await prisma.weeklyGoal.findUnique({
    where: { userId_weekStartDate: { userId, weekStartDate: normalizedWeek } },
  });
  if (!row) return undefined;
  return {
    id: row.id,
    userId: row.userId,
    weekStartDate: row.weekStartDate,
    targetSessions: row.targetSessions,
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
  };
}

export async function getWeeklyGoalProgress(userId: string, weekStartDate?: string) {
  const normalizedWeek = weekStartDate ?? getCurrentWeekStartDate();
  const goal = await getWeeklyGoal(userId, normalizedWeek);

  const weekStart = new Date(`${normalizedWeek}T00:00:00.000Z`);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  const completedSessions = await prisma.workoutSession.count({
    where: {
      userId,
      status: "finished",
      finishedAt: { gte: weekStart, lt: weekEnd },
    },
  });

  const targetSessions = goal?.targetSessions ?? 0;
  const completionRate =
    targetSessions > 0 ? Number(((completedSessions / targetSessions) * 100).toFixed(2)) : 0;

  return {
    weekStartDate: normalizedWeek,
    targetSessions,
    completedSessions,
    completionRate,
    goalReached: targetSessions > 0 && completedSessions >= targetSessions,
  };
}
