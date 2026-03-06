import { Router } from "express";
import { ensureAuthenticated } from "./auth/auth.middleware";
import { prisma } from "../prisma";
import { ok } from "../common/response";

const router = Router();

router.post("/workout-sessions/complete", ensureAuthenticated, async (req, res) => {
  const payload = req.body as {
    workoutTemplateId: string;
    startedAt?: string; completedAt?: string;
    durationMinutes?: number; difficultyRating?: number; energyRating?: number; notes?: string;
    exerciseSessions?: Array<{
      exerciseTemplateId?: string; exerciseId?: string; order?: number;
      startedAt?: string; completedAt?: string; status?: string; notes?: string;
      sets?: Array<{
        setNumber: number; load?: number; reps?: number; restSeconds?: number;
        durationSeconds?: number; calories?: number;
        completed?: boolean; notes?: string; startedAt?: string; completedAt?: string;
      }>;
    }>;
  };

  const session = await prisma.workoutSession.create({
    data: {
      customerId: req.user!.id,
      workoutTemplateId: payload.workoutTemplateId,
      startedAt: payload.startedAt ? new Date(payload.startedAt) : new Date(),
      completedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
      durationMinutes: payload.durationMinutes,
      difficultyRating: payload.difficultyRating,
      energyRating: payload.energyRating,
      notes: payload.notes,
      status: "C",
      exerciseSessions: {
        create: (payload.exerciseSessions ?? []).map((exercise) => ({
          exerciseTemplateId: exercise.exerciseTemplateId,
          exerciseId: exercise.exerciseId,
          order: exercise.order ?? 0,
          startedAt: exercise.startedAt ? new Date(exercise.startedAt) : undefined,
          completedAt: exercise.completedAt ? new Date(exercise.completedAt) : undefined,
          status: exercise.status ?? "C",
          notes: exercise.notes,
          setSessions: {
            create: (exercise.sets ?? []).map((set) => ({
              setNumber: set.setNumber, load: set.load, reps: set.reps, restSeconds: set.restSeconds,
              durationSeconds: set.durationSeconds, calories: set.calories,
              completed: set.completed ?? true, notes: set.notes,
              startedAt: set.startedAt ? new Date(set.startedAt) : undefined,
              completedAt: set.completedAt ? new Date(set.completedAt) : undefined,
            })),
          },
        })),
      },
    },
  });
  return res.status(201).json(ok(session.id, "Workout completed"));
});

router.get("/workout-sessions/history", ensureAuthenticated, async (req, res) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const pageSize = parseInt(String(req.query.pageSize ?? "20"), 10);
  const [totalItems, sessions] = await Promise.all([
    prisma.workoutSession.count({ where: { customerId: req.user!.id } }),
    prisma.workoutSession.findMany({
      where: { customerId: req.user!.id },
      include: { workoutTemplate: true, exerciseSessions: true },
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return res.json(ok({
    items: sessions.map((s) => ({
      id: s.id,
      workoutTemplateTitle: s.workoutTemplate?.title ?? s.titleSnapshot ?? "Treino",
      startedAt: s.startedAt, completedAt: s.completedAt, durationMinutes: s.durationMinutes,
      totalVolume: Number(s.totalVolume ?? 0), status: s.status, difficultyRating: s.difficultyRating,
      exercisesCompleted: s.exerciseSessions.filter((x) => x.status === "C").length,
      totalExercises: s.exerciseSessions.length,
    })),
    totalItems, currentPage: page, pageSize,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  }));
});

router.get("/workout-sessions/exercise/:exerciseId/previous", ensureAuthenticated, async (req, res) => {
  const exerciseId = String(req.params.exerciseId);
  const latestSession = await prisma.workoutSession.findFirst({
    where: { customerId: req.user!.id, exerciseSessions: { some: { exerciseId } } },
    include: {
      exerciseSessions: {
        where: { exerciseId }, include: { setSessions: true },
        orderBy: { createdAt: "desc" }, take: 1,
      },
    },
    orderBy: { startedAt: "desc" },
  });
  const es = latestSession?.exerciseSessions?.[0];
  return res.json(ok((es?.setSessions ?? []).map((set) => ({
    load: set.load ? Number(set.load) : undefined,
    reps: set.reps ?? undefined,
    date: latestSession?.startedAt,
  }))));
});

router.get("/workout-sessions/exercise/:exerciseId/history", ensureAuthenticated, async (req, res) => {
  const exerciseId = String(req.params.exerciseId);
  const sessions = await prisma.workoutSession.findMany({
    where: { customerId: req.user!.id, exerciseSessions: { some: { exerciseId } } },
    include: {
      workoutTemplate: true,
      exerciseSessions: {
        where: { exerciseId }, include: { exercise: true, setSessions: true },
        orderBy: { createdAt: "desc" }, take: 1,
      },
    },
    orderBy: { startedAt: "desc" },
  });
  const valid = sessions.filter((s) => s.exerciseSessions.length > 0);
  if (valid.length === 0) return res.json(ok(null));

  const setsFlat = valid.flatMap((s) => s.exerciseSessions[0].setSessions);
  const totalVolume = setsFlat.reduce((sum, s) => sum + Number(s.load ?? 0) * Number(s.reps ?? 0), 0);
  const totalReps = setsFlat.reduce((sum, s) => sum + Number(s.reps ?? 0), 0);
  const maxLoad = setsFlat.reduce((max, s) => Math.max(max, Number(s.load ?? 0)), 0);
  const avgLoad = setsFlat.length > 0 ? setsFlat.reduce((sum, s) => sum + Number(s.load ?? 0), 0) / setsFlat.length : 0;

  return res.json(ok({
    exerciseId,
    exerciseName: valid[0].exerciseSessions[0].exercise?.name ?? "Exercício",
    videoUrl: valid[0].exerciseSessions[0].exercise?.videoUrl,
    stats: {
      totalSessions: valid.length, totalSets: setsFlat.length, totalReps, totalVolume,
      maxLoad, averageLoad: avgLoad,
      lastPerformed: valid[0].startedAt,
      firstPerformed: valid[valid.length - 1].startedAt,
    },
    sessions: valid.map((session) => {
      const es = session.exerciseSessions[0];
      const sets = es.setSessions.map((s) => ({
        setNumber: s.setNumber,
        load: s.load ? Number(s.load) : undefined,
        reps: s.reps ?? undefined,
        volume: Number(s.load ?? 0) * Number(s.reps ?? 0),
      }));
      const vol = sets.reduce((sum, s) => sum + s.volume, 0);
      const ml = sets.reduce((max, s) => Math.max(max, s.load ?? 0), 0);
      const al = sets.length > 0 ? sets.reduce((sum, s) => sum + (s.load ?? 0), 0) / sets.length : 0;
      return {
        sessionId: session.id,
        performedAt: session.startedAt,
        workoutTemplateTitle: session.workoutTemplate?.title ?? session.titleSnapshot ?? "Treino",
        sets, sessionVolume: vol, maxLoad: ml, averageLoad: al,
        totalReps: sets.reduce((sum, s) => sum + (s.reps ?? 0), 0),
      };
    }),
  }));
});

router.get("/workout-sessions/customer/:customerId", ensureAuthenticated, async (req, res) => {
  const page = parseInt(String(req.query.page ?? "1"), 10);
  const pageSize = parseInt(String(req.query.pageSize ?? "20"), 10);
  const sessions = await prisma.workoutSession.findMany({
    where: { customerId: String(req.params.customerId), routine: { personalId: req.user!.id } },
    include: { workoutTemplate: true, exerciseSessions: true },
    orderBy: { startedAt: "desc" },
    skip: (page - 1) * pageSize, take: pageSize,
  });
  return res.json(ok(sessions.map((s) => ({
    id: s.id,
    workoutTemplateTitle: s.workoutTemplate?.title ?? s.titleSnapshot ?? "Treino",
    startedAt: s.startedAt, completedAt: s.completedAt, durationMinutes: s.durationMinutes,
    totalVolume: Number(s.totalVolume ?? 0), status: s.status, difficultyRating: s.difficultyRating,
    exercisesCompleted: s.exerciseSessions.filter((x) => x.status === "C").length,
    totalExercises: s.exerciseSessions.length,
  }))));
});

router.get("/workout-sessions/:sessionId", ensureAuthenticated, async (req, res) => {
  const session = await prisma.workoutSession.findFirst({
    where: { id: String(req.params.sessionId), customerId: req.user!.id },
    include: {
      workoutTemplate: true, routine: true,
      exerciseSessions: {
        include: { exercise: true, exerciseTemplate: true, setSessions: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!session) return res.status(404).json({ success: false, message: "Session not found" });

  return res.json(ok({
    id: session.id,
    workoutTemplateId: session.workoutTemplateId,
    workoutTemplateTitle: session.workoutTemplate?.title ?? session.titleSnapshot ?? "Treino",
    customerId: session.customerId,
    routineId: session.routineId,
    routineTitle: session.routine?.title,
    startedAt: session.startedAt, completedAt: session.completedAt,
    durationMinutes: session.durationMinutes,
    totalVolume: Number(session.totalVolume ?? 0),
    status: session.status, difficultyRating: session.difficultyRating,
    energyRating: session.energyRating, notes: session.notes, createdAt: session.createdAt,
    exerciseSessions: session.exerciseSessions.map((es) => ({
      id: es.id, workoutSessionId: es.workoutSessionId,
      exerciseTemplateId: es.exerciseTemplateId, exerciseId: es.exerciseId,
      exerciseName: es.exercise?.name ?? "Exercício",
      exerciseImageUrl: es.exercise?.imageUrl, exerciseVideoUrl: es.exercise?.videoUrl,
      order: es.order, startedAt: es.startedAt, completedAt: es.completedAt,
      status: es.status, notes: es.notes,
      targetSets: es.exerciseTemplate?.targetSets,
      targetRepsMin: es.exerciseTemplate?.targetRepsMin,
      targetRepsMax: es.exerciseTemplate?.targetRepsMax,
      suggestedLoad: es.exerciseTemplate?.suggestedLoad ? Number(es.exerciseTemplate.suggestedLoad) : undefined,
      restSeconds: es.exerciseTemplate?.restSeconds,
      setType: es.exerciseTemplate?.setType ?? "Reps",
      weightUnit: es.exerciseTemplate?.weightUnit ?? "kg",
      isBisetWithPrevious: es.exerciseTemplate?.isBisetWithPrevious ?? false,
      targetDurationSeconds: es.exerciseTemplate?.targetDurationSeconds,
      targetCalories: es.exerciseTemplate?.targetCalories ? Number(es.exerciseTemplate.targetCalories) : undefined,
      setSessions: es.setSessions.map((ss) => ({
        id: ss.id, exerciseSessionId: ss.exerciseSessionId, setNumber: ss.setNumber,
        load: ss.load ? Number(ss.load) : undefined, reps: ss.reps,
        restSeconds: ss.restSeconds, completed: ss.completed, notes: ss.notes,
        durationSeconds: ss.durationSeconds,
        calories: ss.calories ? Number(ss.calories) : undefined,
        startedAt: ss.startedAt, completedAt: ss.completedAt,
      })),
    })),
  }));
});

export default router;
