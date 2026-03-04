import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";

const sessionInclude = {
  workoutTemplate: { include: { exerciseTemplates: { include: { exercise: true } } } },
  routine: true,
  exerciseSessions: {
    include: {
      exerciseTemplate: { include: { exercise: true } },
      setSessions: true,
    },
  },
} as const;

export async function startProSession(
  customerId: string,
  data: { workoutTemplateId: string; routineId: string; notes?: string }
) {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id: data.workoutTemplateId },
    include: { exerciseTemplates: { where: { status: "A" }, orderBy: { order: "asc" }, include: { exercise: true } } },
  });
  if (!template) throw new AppError("Workout template not found", 404);

  return prisma.workoutSession.create({
    data: {
      customerId,
      workoutTemplateId: data.workoutTemplateId,
      routineId: data.routineId,
      titleSnapshot: template.title,
      status: "IP",
      notes: data.notes,
      exerciseSessions: {
        create: template.exerciseTemplates.map((et, i) => ({
          exerciseTemplateId: et.id,
          exerciseId: et.exerciseId,
          order: i,
          plannedSets: et.targetSets,
          plannedReps: et.targetRepsMin ?? et.targetRepsMax,
          status: "NS",
        })),
      },
    },
    include: sessionInclude,
  });
}

export async function listProSessions(customerId: string) {
  return prisma.workoutSession.findMany({
    where: { customerId },
    include: sessionInclude,
    orderBy: { startedAt: "desc" },
  });
}

export async function getProSessionById(customerId: string, sessionId: string) {
  const s = await prisma.workoutSession.findFirst({ where: { id: sessionId, customerId }, include: sessionInclude });
  if (!s) throw new AppError("Session not found", 404);
  return s;
}

export async function finishProSession(
  customerId: string,
  sessionId: string,
  data: {
    notes?: string;
    difficultyRating?: number;
    energyRating?: number;
    exercises?: Array<{ exerciseTemplateId: string; sets: Array<{ setNumber: number; load?: number; reps?: number; restSeconds?: number; completed?: boolean; notes?: string }> }>;
  }
) {
  const session = await getProSessionById(customerId, sessionId);
  if (session.status === "C") throw new AppError("Session already finished", 409);

  if (data.exercises) {
    for (const ex of data.exercises) {
      const es = await prisma.exerciseSession.findFirst({
        where: { workoutSessionId: sessionId, exerciseTemplateId: ex.exerciseTemplateId },
      });
      if (!es) continue;
      await prisma.exerciseSession.update({ where: { id: es.id }, data: { status: "C", completedAt: new Date() } });
      for (const set of ex.sets) {
        await prisma.setSession.create({
          data: { exerciseSessionId: es.id, ...set },
        });
      }
    }
  }

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: "C",
      completedAt: new Date(),
      notes: data.notes,
      difficultyRating: data.difficultyRating,
      energyRating: data.energyRating,
    },
    include: sessionInclude,
  });
}
