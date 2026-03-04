import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { errorHandler } from "./common/error-handler";
import { loginSelfManaged, registerSelfManaged, sendMagicLinkHandler, validateMagicLinkHandler } from "./modules/auth/auth.controller";
import { ensureAuthenticated } from "./modules/auth/auth.middleware";
import { validateMagicLink } from "./modules/auth/magic-link.service";
import { getHealth } from "./modules/health/health.controller";
import { prisma } from "./prisma";
import {
  listExercises as listExercisesService,
  getExerciseById,
  getCategories,
  getMuscleGroups,
  getExercisesByMuscleGroup,
  createExercise as createExerciseService,
  updateExercise as updateExerciseService,
  updateExerciseMedia,
  deleteExercise,
  getUserExercises,
} from "./modules/exercises/exercises.service";
import {
  createRoutine as createRoutineService,
  updateRoutine as updateRoutineService,
  deleteRoutine as deleteRoutineService,
  getRoutineById,
  getRoutinesByPersonal,
  assignRoutineToCustomer,
  unassignRoutineFromCustomer,
  getCustomerRoutines,
  getRoutineCustomers,
  getRoutinesNearExpiry,
  updateCustomerRoutineExpiry,
} from "./modules/routines/routines.service";
import {
  createTemplate,
  getTemplateById,
  getTemplatesByRoutine,
  updateTemplate,
  deleteTemplate,
  addExerciseToTemplate,
  updateExerciseTemplate as updateExerciseTemplateService,
  removeExerciseFromTemplate,
  reorderExercises,
} from "./modules/pro-workout-templates/pro-workout-templates.service";
import { listAppointments as listAppointmentsService } from "./modules/appointments/appointments.service";
import { listFeedbacksByProfessional } from "./modules/feedback/feedback.service";
import { getActiveStudents as getActiveStudentsService } from "./modules/bonds/bonds.service";

// Self-managed
import {
  createMyWorkoutTemplate, deleteMyWorkoutTemplate, finishMyWorkoutSession,
  getMyWeeklyGoal, getMyWeeklyProgress, getMyProfile, getMyWorkoutSession,
  getMyWorkoutTemplate, listMyWorkoutSessions, listMyWorkoutTemplates,
  startMyWorkoutSession, upsertMyWeeklyGoal, updateMyProfile, updateMyWorkoutTemplate,
} from "./modules/self-managed/self-managed.controller";

// Users
import { listUsers, getUser, updateUserHandler, deleteUserHandler, getUserFeedbacks } from "./modules/users/users.controller";

// Bonds
import {
  listBonds, getBond, sentBonds, receivedBonds, bondsAsCustomer,
  bondsAsProfessional, myBonds, activeStudents, createBondHandler,
  updateBondHandler, deleteBondHandler,
} from "./modules/bonds/bonds.controller";

// Exercises
import {
  list as listExercises, search as searchExercises, getById as getExercise,
  listCategories, listMuscleGroups, byMuscleGroup, create as createExercise,
  update as updateExercise, patchMedia, remove as removeExerciseController, myExercises,
} from "./modules/exercises/exercises.controller";

// Routines
import {
  create as createRoutine, update as updateRoutine, remove as removeRoutine,
  getById as getRoutine, myRoutines, assign, unassign, myAssignedRoutines,
  customerRoutinesHandler, routineCustomers, nearExpiry, updateExpiry,
} from "./modules/routines/routines.controller";

// Pro Workout Templates
import {
  create as createProTemplate, getById as getProTemplate, byRoutine,
  update as updateProTemplate, remove as removeProTemplate, addExercise,
  updateExercise as updateExerciseTemplate, removeExercise as removeExerciseTemplateController, reorder,
} from "./modules/pro-workout-templates/pro-workout-templates.controller";

// Pro Workout Sessions
import {
  start as startProSession, list as listProSessions, getById as getProSession, finish as finishProSession,
} from "./modules/pro-workout-sessions/pro-workout-sessions.controller";

// Favorites
import { add as addFavorite, remove as removeFavorite, list as listFavorites } from "./modules/favorites/favorites.controller";

// Feedback
import { create as createFeedback, listByProfessional, getById as getFeedback } from "./modules/feedback/feedback.controller";

// Appointments
import { create as createAppointment, list as listAppointments, update as updateAppointment, remove as removeAppointment } from "./modules/appointments/appointments.controller";

// Push
import { subscribeHandler, unsubscribeHandler } from "./modules/push/push.controller";

// Storage
import multer from "multer";
import {
  deleteExerciseMediaHandler,
  deleteImageHandler,
  getPresignedUrlHandler,
  uploadExerciseMediaHandler,
  uploadImageHandler,
} from "./modules/storage/storage.controller";

export function createApp() {
  const app = express();

  const ok = <T>(data: T, message = "OK") => ({ success: true, message, data });
  const toPagination = (total: number, page: number, pageSize: number) => ({
    currentPage: page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    totalCount: total,
  });
  const toLegacyExercise = (exercise: any, userId?: string) => ({
    id: exercise.id,
    name: exercise.name,
    imageUrl: exercise.imageUrl,
    instruction: exercise.instruction,
    videoUrl: exercise.videoUrl,
    categoryName: exercise.category?.name,
    primaryMuscles: exercise.primaryMuscles?.map((m: any) => m.muscle?.name).filter(Boolean) ?? [],
    secondaryMuscles: exercise.secondaryMuscles?.map((m: any) => m.muscle?.name).filter(Boolean) ?? [],
    createdByUserId: exercise.createdByUserId,
    isPublished: exercise.isPublished,
    isCustom: !!userId && exercise.createdByUserId === userId,
  });

  app.use((req, _res, next) => {
    if (req.url === "/api") {
      req.url = "/";
    } else if (req.url.startsWith("/api/")) {
      req.url = req.url.slice(4);
    }
    next();
  });

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp());

  // Health
  app.get("/health", getHealth);

  // Auth
  app.post("/auth/self-managed/register", registerSelfManaged);
  app.post("/auth/self-managed/login", loginSelfManaged);
  app.post("/auth/magic-link/send", sendMagicLinkHandler);
  app.post("/auth/magic-link/validate", validateMagicLinkHandler);

  // Legacy auth aliases (.NET compatibility)
  app.post("/authentication/sendAccessEmail", sendMagicLinkHandler);
  app.post("/authentication/validateSession", async (req, res, next) => {
    try {
      const tokenFromQuery = typeof req.query.token === "string" ? req.query.token : undefined;
      const tokenFromBody = typeof req.body?.token === "string" ? req.body.token : undefined;
      const token = tokenFromQuery ?? tokenFromBody ?? "";
      const jwt = await validateMagicLink(token);
      return res.status(200).json(jwt);
    } catch (error) {
      return next(error);
    }
  });

  // Self-managed user routes
  app.get("/users/me", ensureAuthenticated, getMyProfile);
  app.put("/users/me", ensureAuthenticated, updateMyProfile);
  app.get("/workouts/templates", ensureAuthenticated, listMyWorkoutTemplates);
  app.post("/workouts/templates", ensureAuthenticated, createMyWorkoutTemplate);
  app.get("/workouts/templates/:workoutId", ensureAuthenticated, getMyWorkoutTemplate);
  app.put("/workouts/templates/:workoutId", ensureAuthenticated, updateMyWorkoutTemplate);
  app.delete("/workouts/templates/:workoutId", ensureAuthenticated, deleteMyWorkoutTemplate);
  app.get("/workouts/sessions", ensureAuthenticated, listMyWorkoutSessions);
  app.post("/workouts/sessions", ensureAuthenticated, startMyWorkoutSession);
  app.get("/workouts/sessions/:sessionId", ensureAuthenticated, getMyWorkoutSession);
  app.post("/workouts/sessions/:sessionId/finish", ensureAuthenticated, finishMyWorkoutSession);
  app.get("/goals/weekly", ensureAuthenticated, getMyWeeklyGoal);
  app.put("/goals/weekly", ensureAuthenticated, upsertMyWeeklyGoal);
  app.get("/goals/weekly/progress", ensureAuthenticated, getMyWeeklyProgress);

  // Users
  app.get("/users", ensureAuthenticated, listUsers);
  app.get("/users/:id/feedbacks", ensureAuthenticated, getUserFeedbacks);
  app.get("/users/:id", ensureAuthenticated, getUser);
  app.put("/users/:id", ensureAuthenticated, updateUserHandler);
  app.delete("/users/:id", ensureAuthenticated, deleteUserHandler);

  // Bonds
  app.get("/bonds", ensureAuthenticated, listBonds);
  app.get("/bonds/sent", ensureAuthenticated, sentBonds);
  app.get("/bonds/received", ensureAuthenticated, receivedBonds);
  app.get("/bonds/as-customer", ensureAuthenticated, bondsAsCustomer);
  app.get("/bonds/as-professional", ensureAuthenticated, bondsAsProfessional);
  app.get("/bonds/my-bonds", ensureAuthenticated, myBonds);
  app.get("/bonds/active-students", ensureAuthenticated, activeStudents);
  app.get("/bonds/:id", ensureAuthenticated, getBond);
  app.post("/bonds", ensureAuthenticated, createBondHandler);
  app.put("/bonds/:id", ensureAuthenticated, updateBondHandler);
  app.delete("/bonds/:id", ensureAuthenticated, deleteBondHandler);

  // Exercises
  app.get("/exercises/categories", ensureAuthenticated, listCategories);
  app.get("/exercises/muscle-groups", ensureAuthenticated, listMuscleGroups);
  app.get("/exercises/muscle-groups/:muscleGroupId/exercises", ensureAuthenticated, byMuscleGroup);
  app.get("/exercises/search", ensureAuthenticated, searchExercises);
  app.get("/exercises/my-exercises", ensureAuthenticated, myExercises);
  app.get("/exercises/:exerciseId", ensureAuthenticated, getExercise);
  app.get("/exercises", ensureAuthenticated, listExercises);
  app.post("/exercises", ensureAuthenticated, createExercise);
  app.put("/exercises/:exerciseId", ensureAuthenticated, updateExercise);
  app.patch("/exercises/:exerciseId/media", ensureAuthenticated, patchMedia);
  app.delete("/exercises/:exerciseId", ensureAuthenticated, removeExerciseController);

  // Routines
  app.get("/routines/near-expiry", ensureAuthenticated, nearExpiry);
  app.get("/routines/my-routines", ensureAuthenticated, myRoutines);
  app.get("/routines/my-assigned-routines", ensureAuthenticated, myAssignedRoutines);
  app.get("/routines/customer/:customerId", ensureAuthenticated, customerRoutinesHandler);
  app.get("/routines/:routineId/customers", ensureAuthenticated, routineCustomers);
  app.put("/routines/:routineId/customer/:customerId/expiry", ensureAuthenticated, updateExpiry);
  app.delete("/routines/:routineId/customer/:customerId", ensureAuthenticated, unassign);
  app.post("/routines/assign", ensureAuthenticated, assign);
  app.get("/routines/:routineId", ensureAuthenticated, getRoutine);
  app.post("/routines", ensureAuthenticated, createRoutine);
  app.put("/routines/:routineId", ensureAuthenticated, updateRoutine);
  app.delete("/routines/:routineId", ensureAuthenticated, removeRoutine);

  // Pro Workout Templates
  app.post("/workout-templates/routine/:routineId", ensureAuthenticated, createProTemplate);
  app.get("/workout-templates/routine/:routineId", ensureAuthenticated, byRoutine);
  app.get("/workout-templates/:templateId", ensureAuthenticated, getProTemplate);
  app.put("/workout-templates/:templateId", ensureAuthenticated, updateProTemplate);
  app.delete("/workout-templates/:templateId", ensureAuthenticated, removeProTemplate);
  app.post("/workout-templates/:templateId/exercises", ensureAuthenticated, addExercise);
  app.put("/workout-templates/exercise/:exerciseTemplateId", ensureAuthenticated, updateExerciseTemplate);
  app.delete("/workout-templates/exercise/:exerciseTemplateId", ensureAuthenticated, removeExerciseTemplateController);
  app.put("/workout-templates/:templateId/reorder", ensureAuthenticated, reorder);

  // Pro Workout Sessions
  app.post("/pro-sessions", ensureAuthenticated, startProSession);
  app.get("/pro-sessions", ensureAuthenticated, listProSessions);
  app.get("/pro-sessions/:sessionId", ensureAuthenticated, getProSession);
  app.post("/pro-sessions/:sessionId/finish", ensureAuthenticated, finishProSession);

  // Favorites
  app.post("/favorites", ensureAuthenticated, addFavorite);
  app.delete("/favorites/:professionalId", ensureAuthenticated, removeFavorite);
  app.get("/favorites", ensureAuthenticated, listFavorites);

  // Feedback
  app.post("/feedbacks", ensureAuthenticated, createFeedback);
  app.get("/feedbacks", ensureAuthenticated, listByProfessional);
  app.get("/feedbacks/:id", ensureAuthenticated, getFeedback);

  // Appointments
  app.post("/appointments", ensureAuthenticated, createAppointment);
  app.get("/appointments", ensureAuthenticated, listAppointments);
  app.put("/appointments/:id", ensureAuthenticated, updateAppointment);
  app.delete("/appointments/:id", ensureAuthenticated, removeAppointment);

  // Push
  app.post("/push/subscribe", ensureAuthenticated, subscribeHandler);
  app.delete("/push/unsubscribe", ensureAuthenticated, unsubscribeHandler);

  // Extended legacy compatibility (frontend contract)
  app.post("/user", ensureAuthenticated, async (req, res) => {
    const payload = req.body ?? {};
    const created = await prisma.user.create({
      data: {
        profile: { connect: { id: payload.profileId } },
        name: payload.name,
        email: payload.email,
        imageUrl: payload.imageUrl,
        sex: payload.sex ?? "",
        phoneNumber: payload.phoneNumber ?? "",
        dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
        status: "A",
        address: payload.address
          ? {
              create: {
                addressLine: payload.address.addressLine,
                number: payload.address.number,
                city: payload.address.city,
                state: payload.address.state,
                zipCode: payload.address.zipCode,
                country: payload.address.country ?? "Brasil",
                addressType: payload.address.addressType ?? 0,
              },
            }
          : undefined,
      },
      include: { profile: true, address: true },
    });
    return res.status(201).json(created);
  });
  app.post("/user/geocode-addresses", ensureAuthenticated, async (_req, res) => {
    return res.status(200).json({ message: "Geocoding skipped", processed: 0, success: 0, failed: 0 });
  });

  app.get("/bond/active-students", ensureAuthenticated, async (req, res) => {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const pageSize = parseInt(String(req.query.pageSize ?? "10"), 10);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const result = await getActiveStudentsService(req.user!.id, page, pageSize, search);
    return res.json(ok({ items: result.data, pagination: toPagination(result.total, result.page, result.pageSize) }));
  });

  app.get("/exercise", ensureAuthenticated, async (req, res) => {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const pageSize = parseInt(String(req.query.pageSize ?? "50"), 10);
    const result = await listExercisesService(page, pageSize, req.user?.id);
    return res.json(ok(result.data.map((x) => toLegacyExercise(x, req.user?.id))));
  });
  app.get("/exercise/categories", ensureAuthenticated, async (_req, res) => {
    return res.json(ok(await getCategories()));
  });
  app.get("/exercise/muscle-groups", ensureAuthenticated, async (_req, res) => {
    return res.json(ok(await getMuscleGroups()));
  });
  app.get("/exercise/muscle-groups/:muscleGroupId/exercises", ensureAuthenticated, async (req, res) => {
    const data = await getExercisesByMuscleGroup(String(req.params.muscleGroupId));
    return res.json(ok(data.map((x) => toLegacyExercise(x, req.user?.id))));
  });
  app.get("/exercise/:exerciseId", ensureAuthenticated, async (req, res) => {
    const exercise = await getExerciseById(String(req.params.exerciseId));
    return res.json(ok(toLegacyExercise(exercise, req.user?.id)));
  });
  app.post("/exercise", ensureAuthenticated, async (req, res) => {
    const created = await createExerciseService(req.user!.id, req.body);
    return res.status(201).json(ok(toLegacyExercise(created, req.user?.id), "Exercise created"));
  });
  app.put("/exercise/:exerciseId", ensureAuthenticated, async (req, res) => {
    const updated = await updateExerciseService(String(req.params.exerciseId), req.user!.id, req.body);
    return res.json(ok(toLegacyExercise(updated, req.user?.id), "Exercise updated"));
  });
  app.patch("/exercise/:exerciseId/media", ensureAuthenticated, async (req, res) => {
    const updated = await updateExerciseMedia(String(req.params.exerciseId), req.body ?? {});
    return res.json(ok(toLegacyExercise(updated, req.user?.id), "Exercise media updated"));
  });
  app.delete("/exercise/:exerciseId", ensureAuthenticated, async (req, res) => {
    await deleteExercise(String(req.params.exerciseId), req.user!.id);
    return res.status(200).json(ok(true, "Exercise deleted"));
  });

  app.get("/routine/my-routines", ensureAuthenticated, async (req, res) => {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const pageSize = parseInt(String(req.query.pageSize ?? "10"), 10);
    const result = await getRoutinesByPersonal(req.user!.id, page, pageSize);
    return res.json(ok({ items: result.data, pagination: toPagination(result.total, result.page, result.pageSize) }));
  });
  app.get("/routine/my-assigned-routines", ensureAuthenticated, async (req, res) => {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const pageSize = parseInt(String(req.query.pageSize ?? "10"), 10);
    const result = await getCustomerRoutines(req.user!.id, page, pageSize);
    return res.json(ok({ items: result.data.map((x) => x.routine), pagination: toPagination(result.total, result.page, result.pageSize) }));
  });
  app.get("/routine/customer/:customerId", ensureAuthenticated, async (req, res) => {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const pageSize = parseInt(String(req.query.pageSize ?? "10"), 10);
    const result = await getCustomerRoutines(String(req.params.customerId), page, pageSize);
    return res.json(ok({ items: result.data.map((x) => x.routine), pagination: toPagination(result.total, result.page, result.pageSize) }));
  });
  app.get("/routine/:routineId/customers", ensureAuthenticated, async (req, res) => {
    const data = await getRoutineCustomers(String(req.params.routineId), req.user!.id);
    return res.json(ok({ assignedCustomers: data.assigned.map((a) => ({ ...a.customer, assignedAt: a.createdAt, expiresAt: a.expiresAt })) , availableCustomers: [] }));
  });
  app.get("/routine/near-expiry", ensureAuthenticated, async (req, res) => {
    const daysThreshold = parseInt(String(req.query.daysThreshold ?? "5"), 10);
    const data = await getRoutinesNearExpiry(req.user!.id, daysThreshold);
    return res.json(ok(data.map((x) => ({
      customerId: x.customerId,
      customerName: x.customer.name,
      customerImageUrl: undefined,
      routineId: x.routineId,
      routineTitle: x.routine.title,
      expiresAt: x.expiresAt,
      daysUntilExpiry: x.expiresAt ? Math.ceil((new Date(x.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
    }))));
  });
  app.get("/routine/:routineId", ensureAuthenticated, async (req, res) => {
    return res.json(ok(await getRoutineById(String(req.params.routineId))));
  });
  app.post("/routine", ensureAuthenticated, async (req, res) => {
    const created = await createRoutineService(req.user!.id, req.body);
    return res.status(201).json(ok(created, "Routine created"));
  });
  app.put("/routine/:routineId", ensureAuthenticated, async (req, res) => {
    const updated = await updateRoutineService(String(req.params.routineId), req.user!.id, req.body);
    return res.json(ok(updated, "Routine updated"));
  });
  app.delete("/routine/:routineId", ensureAuthenticated, async (req, res) => {
    await deleteRoutineService(String(req.params.routineId), req.user!.id);
    return res.json(ok(true, "Routine deleted"));
  });
  app.post("/routine/assign", ensureAuthenticated, async (req, res) => {
    const created = await assignRoutineToCustomer(req.user!.id, req.body);
    return res.status(201).json(ok(created, "Routine assigned"));
  });
  app.delete("/routine/:routineId/customer/:customerId", ensureAuthenticated, async (req, res) => {
    await unassignRoutineFromCustomer(String(req.params.routineId), String(req.params.customerId), req.user!.id);
    return res.json(ok(true, "Routine unassigned"));
  });
  app.put("/routine/:routineId/customer/:customerId/expiry", ensureAuthenticated, async (req, res) => {
    const updated = await updateCustomerRoutineExpiry(String(req.params.routineId), String(req.params.customerId), req.user!.id, req.body?.expiresAt ?? null);
    return res.json(ok(updated, "Expiry updated"));
  });

  app.post("/workoutTemplate/routine/:routineId", ensureAuthenticated, async (req, res) => {
    const payload = req.body ?? {};

    const created = await createTemplate(String(req.params.routineId), req.user!.id, {
      title: payload.title,
      description: payload.description,
      estimatedDurationMinutes: payload.estimatedDurationMinutes,
      order: payload.order,
    });

    const incomingExercises = Array.isArray(payload.exerciseTemplates)
      ? payload.exerciseTemplates
      : [];

    if (incomingExercises.length > 0) {
      for (const exerciseTemplate of incomingExercises) {
        if (!exerciseTemplate?.exerciseId || !exerciseTemplate?.targetSets) continue;

        await addExerciseToTemplate(created.id, req.user!.id, {
          exerciseId: exerciseTemplate.exerciseId,
          order: exerciseTemplate.order ?? 0,
          targetSets: exerciseTemplate.targetSets,
          targetRepsMin: exerciseTemplate.targetRepsMin,
          targetRepsMax: exerciseTemplate.targetRepsMax,
          suggestedLoad: exerciseTemplate.suggestedLoad,
          restSeconds: exerciseTemplate.restSeconds,
          notes: exerciseTemplate.notes,
        });
      }
    }

    const templateWithExercises = await getTemplateById(created.id);
    return res.status(201).json(ok(templateWithExercises, "Template created"));
  });
  app.get("/workoutTemplate/routine/:routineId", ensureAuthenticated, async (req, res) => {
    return res.json(ok(await getTemplatesByRoutine(String(req.params.routineId))));
  });
  app.get("/workoutTemplate/:templateId", ensureAuthenticated, async (req, res) => {
    return res.json(ok(await getTemplateById(String(req.params.templateId))));
  });
  app.put("/workoutTemplate/:templateId", ensureAuthenticated, async (req, res) => {
    const updated = await updateTemplate(String(req.params.templateId), req.user!.id, req.body);
    return res.json(ok(updated, "Template updated"));
  });
  app.delete("/workoutTemplate/:templateId", ensureAuthenticated, async (req, res) => {
    await deleteTemplate(String(req.params.templateId), req.user!.id);
    return res.json(ok(true, "Template deleted"));
  });
  app.post("/workoutTemplate/:templateId/exercises", ensureAuthenticated, async (req, res) => {
    const created = await addExerciseToTemplate(String(req.params.templateId), req.user!.id, req.body);
    return res.status(201).json(ok(created, "Exercise added"));
  });
  app.put("/workoutTemplate/exercise/:exerciseTemplateId", ensureAuthenticated, async (req, res) => {
    const updated = await updateExerciseTemplateService(String(req.params.exerciseTemplateId), req.user!.id, req.body);
    return res.json(ok(updated, "Exercise updated"));
  });
  app.delete("/workoutTemplate/exercise/:exerciseTemplateId", ensureAuthenticated, async (req, res) => {
    await removeExerciseFromTemplate(String(req.params.exerciseTemplateId), req.user!.id);
    return res.json(ok(true, "Exercise removed"));
  });
  app.put("/workoutTemplate/:templateId/reorder", ensureAuthenticated, async (req, res) => {
    const reordered = await reorderExercises(String(req.params.templateId), req.user!.id, req.body);
    return res.json(ok(reordered, "Template reordered"));
  });

  app.get("/appointment/bond/:bondId", ensureAuthenticated, async (req, res) => {
    const items = await prisma.appointment.findMany({ where: { customerProfessionalBondId: String(req.params.bondId) }, include: { bond: true, address: true } });
    return res.json(items);
  });
  app.get("/appointment/customer/pending", ensureAuthenticated, async (req, res) => {
    const items = await listAppointmentsService(req.user!.id);
    return res.json(items.filter((x) => x.bond.customerId === req.user!.id && x.status === "P"));
  });
  app.get("/appointment/customer/all", ensureAuthenticated, async (req, res) => {
    const items = await listAppointmentsService(req.user!.id);
    return res.json(items.filter((x) => x.bond.customerId === req.user!.id));
  });
  app.get("/appointment/professional/all", ensureAuthenticated, async (req, res) => {
    const items = await listAppointmentsService(req.user!.id);
    return res.json(items.filter((x) => x.bond.professionalId === req.user!.id));
  });
  app.get("/appointment/:id", ensureAuthenticated, async (req, res) => {
    const item = await prisma.appointment.findUnique({ where: { id: String(req.params.id) }, include: { bond: true, address: true } });
    if (!item) return res.status(404).json({ message: "Appointment not found" });
    return res.json(item);
  });

  app.get("/feedback/professional/:professionalId", ensureAuthenticated, async (req, res) => {
    return res.json(await listFeedbacksByProfessional(String(req.params.professionalId)));
  });
  app.get("/feedback/bond", ensureAuthenticated, async (req, res) => {
    const customerId = String(req.query.customerId ?? "");
    const professionalId = String(req.query.professionalId ?? "");
    const item = await prisma.customerFeedback.findFirst({
      where: { customerId, professionalId, status: "A" },
      orderBy: { createdAt: "desc" },
    });
    if (!item) return res.status(404).json({ message: "Feedback not found" });
    return res.json(item);
  });

  app.get("/Favorite/check/:professionalId", ensureAuthenticated, async (req, res) => {
    const favorite = await prisma.favoriteProfessional.findUnique({
      where: { customerId_professionalId: { customerId: req.user!.id, professionalId: String(req.params.professionalId) } },
    });
    return res.json({ isFavorite: !!favorite });
  });

  app.post("/workoutSession/complete", ensureAuthenticated, async (req, res) => {
    const payload = req.body as {
      workoutTemplateId: string;
      startedAt?: string;
      completedAt?: string;
      durationMinutes?: number;
      difficultyRating?: number;
      energyRating?: number;
      notes?: string;
      exerciseSessions?: Array<{
        exerciseTemplateId?: string;
        exerciseId?: string;
        order?: number;
        startedAt?: string;
        completedAt?: string;
        status?: string;
        notes?: string;
        sets?: Array<{ setNumber: number; load?: number; reps?: number; restSeconds?: number; completed?: boolean; notes?: string; startedAt?: string; completedAt?: string }>;
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
                setNumber: set.setNumber,
                load: set.load,
                reps: set.reps,
                restSeconds: set.restSeconds,
                completed: set.completed ?? true,
                notes: set.notes,
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
  app.get("/workoutSession/history", ensureAuthenticated, async (req, res) => {
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
      items: sessions.map((session) => ({
        id: session.id,
        workoutTemplateTitle: session.workoutTemplate?.title ?? session.titleSnapshot ?? "Treino",
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        durationMinutes: session.durationMinutes,
        totalVolume: Number(session.totalVolume ?? 0),
        status: session.status,
        difficultyRating: session.difficultyRating,
        exercisesCompleted: session.exerciseSessions.filter((x) => x.status === "C").length,
        totalExercises: session.exerciseSessions.length,
      })),
      totalItems,
      currentPage: page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    }));
  });
  app.get("/workoutSession/exercise/:exerciseId/previous", ensureAuthenticated, async (req, res) => {
    const exerciseId = String(req.params.exerciseId);
    const latestSession = await prisma.workoutSession.findFirst({
      where: { customerId: req.user!.id, exerciseSessions: { some: { exerciseId } } },
      include: {
        exerciseSessions: {
          where: { exerciseId },
          include: { setSessions: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { startedAt: "desc" },
    });
    const exerciseSession = latestSession?.exerciseSessions?.[0];
    const data = (exerciseSession?.setSessions ?? []).map((set) => ({
      load: set.load ? Number(set.load) : undefined,
      reps: set.reps ?? undefined,
      date: latestSession?.startedAt,
    }));
    return res.json(ok(data));
  });
  app.get("/workoutSession/exercise/:exerciseId/history", ensureAuthenticated, async (req, res) => {
    const exerciseId = String(req.params.exerciseId);
    const sessions = await prisma.workoutSession.findMany({
      where: { customerId: req.user!.id, exerciseSessions: { some: { exerciseId } } },
      include: {
        workoutTemplate: true,
        exerciseSessions: {
          where: { exerciseId },
          include: { exercise: true, setSessions: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { startedAt: "desc" },
    });
    const validSessions = sessions.filter((session) => session.exerciseSessions.length > 0);
    if (validSessions.length === 0) {
      return res.json(ok(null));
    }

    const setsFlat = validSessions.flatMap((session) => session.exerciseSessions[0].setSessions);
    const totalVolume = setsFlat.reduce((sum, set) => sum + Number(set.load ?? 0) * Number(set.reps ?? 0), 0);
    const totalReps = setsFlat.reduce((sum, set) => sum + Number(set.reps ?? 0), 0);
    const maxLoad = setsFlat.reduce((max, set) => Math.max(max, Number(set.load ?? 0)), 0);
    const avgLoad = setsFlat.length > 0 ? setsFlat.reduce((sum, set) => sum + Number(set.load ?? 0), 0) / setsFlat.length : 0;

    return res.json(ok({
      exerciseId,
      exerciseName: validSessions[0].exerciseSessions[0].exercise?.name ?? "Exercício",
      videoUrl: validSessions[0].exerciseSessions[0].exercise?.videoUrl,
      stats: {
        totalSessions: validSessions.length,
        totalSets: setsFlat.length,
        totalReps,
        totalVolume,
        maxLoad,
        averageLoad: avgLoad,
        lastPerformed: validSessions[0].startedAt,
        firstPerformed: validSessions[validSessions.length - 1].startedAt,
      },
      sessions: validSessions.map((session) => {
        const exerciseSession = session.exerciseSessions[0];
        const exerciseSets = exerciseSession.setSessions.map((set) => ({
          setNumber: set.setNumber,
          load: set.load ? Number(set.load) : undefined,
          reps: set.reps ?? undefined,
          volume: Number(set.load ?? 0) * Number(set.reps ?? 0),
        }));
        const sessionVolume = exerciseSets.reduce((sum, set) => sum + set.volume, 0);
        const sessionMaxLoad = exerciseSets.reduce((max, set) => Math.max(max, set.load ?? 0), 0);
        const sessionAverageLoad = exerciseSets.length > 0 ? exerciseSets.reduce((sum, set) => sum + (set.load ?? 0), 0) / exerciseSets.length : 0;
        return {
          sessionId: session.id,
          performedAt: session.startedAt,
          workoutTemplateTitle: session.workoutTemplate?.title ?? session.titleSnapshot ?? "Treino",
          sets: exerciseSets,
          sessionVolume,
          maxLoad: sessionMaxLoad,
          averageLoad: sessionAverageLoad,
          totalReps: exerciseSets.reduce((sum, set) => sum + (set.reps ?? 0), 0),
        };
      }),
    }));
  });
  app.get("/workoutSession/customer/:customerId", ensureAuthenticated, async (req, res) => {
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const pageSize = parseInt(String(req.query.pageSize ?? "20"), 10);
    const sessions = await prisma.workoutSession.findMany({
      where: { customerId: String(req.params.customerId), routine: { personalId: req.user!.id } },
      include: { workoutTemplate: true, exerciseSessions: true },
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return res.json(ok(sessions.map((session) => ({
      id: session.id,
      workoutTemplateTitle: session.workoutTemplate?.title ?? session.titleSnapshot ?? "Treino",
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      durationMinutes: session.durationMinutes,
      totalVolume: Number(session.totalVolume ?? 0),
      status: session.status,
      difficultyRating: session.difficultyRating,
      exercisesCompleted: session.exerciseSessions.filter((x) => x.status === "C").length,
      totalExercises: session.exerciseSessions.length,
    }))));
  });
  app.get("/workoutSession/:sessionId", ensureAuthenticated, async (req, res) => {
    const session = await prisma.workoutSession.findFirst({
      where: { id: String(req.params.sessionId), customerId: req.user!.id },
      include: {
        workoutTemplate: true,
        routine: true,
        exerciseSessions: {
          include: {
            exercise: true,
            exerciseTemplate: true,
            setSessions: true,
          },
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
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      durationMinutes: session.durationMinutes,
      totalVolume: Number(session.totalVolume ?? 0),
      status: session.status,
      difficultyRating: session.difficultyRating,
      energyRating: session.energyRating,
      notes: session.notes,
      createdAt: session.createdAt,
      exerciseSessions: session.exerciseSessions.map((exerciseSession) => ({
        id: exerciseSession.id,
        workoutSessionId: exerciseSession.workoutSessionId,
        exerciseTemplateId: exerciseSession.exerciseTemplateId,
        exerciseId: exerciseSession.exerciseId,
        exerciseName: exerciseSession.exercise?.name ?? "Exercício",
        exerciseImageUrl: exerciseSession.exercise?.imageUrl,
        exerciseVideoUrl: exerciseSession.exercise?.videoUrl,
        order: exerciseSession.order,
        startedAt: exerciseSession.startedAt,
        completedAt: exerciseSession.completedAt,
        status: exerciseSession.status,
        notes: exerciseSession.notes,
        targetSets: exerciseSession.exerciseTemplate?.targetSets,
        targetRepsMin: exerciseSession.exerciseTemplate?.targetRepsMin,
        targetRepsMax: exerciseSession.exerciseTemplate?.targetRepsMax,
        suggestedLoad: exerciseSession.exerciseTemplate?.suggestedLoad ? Number(exerciseSession.exerciseTemplate.suggestedLoad) : undefined,
        restSeconds: exerciseSession.exerciseTemplate?.restSeconds,
        setSessions: exerciseSession.setSessions.map((setSession) => ({
          id: setSession.id,
          exerciseSessionId: setSession.exerciseSessionId,
          setNumber: setSession.setNumber,
          load: setSession.load ? Number(setSession.load) : undefined,
          reps: setSession.reps,
          restSeconds: setSession.restSeconds,
          completed: setSession.completed,
          notes: setSession.notes,
          startedAt: setSession.startedAt,
          completedAt: setSession.completedAt,
        })),
      })),
    }));
  });

  // Legacy route aliases (.NET compatibility)
  app.get("/user", ensureAuthenticated, listUsers);
  app.get("/user/:id/feedbacks", ensureAuthenticated, getUserFeedbacks);
  app.get("/user/:id", ensureAuthenticated, getUser);
  app.put("/user/:id", ensureAuthenticated, updateUserHandler);
  app.delete("/user/:id", ensureAuthenticated, deleteUserHandler);

  app.get("/bond", ensureAuthenticated, listBonds);
  app.get("/bond/sent", ensureAuthenticated, sentBonds);
  app.get("/bond/received", ensureAuthenticated, receivedBonds);
  app.get("/bond/as-customer", ensureAuthenticated, bondsAsCustomer);
  app.get("/bond/as-professional", ensureAuthenticated, bondsAsProfessional);
  app.get("/bond/my-bonds", ensureAuthenticated, myBonds);
  app.get("/bond/active-students", ensureAuthenticated, activeStudents);
  app.get("/bond/:id", ensureAuthenticated, getBond);
  app.post("/bond", ensureAuthenticated, createBondHandler);
  app.put("/bond/:id", ensureAuthenticated, updateBondHandler);
  app.delete("/bond/:id", ensureAuthenticated, deleteBondHandler);

  app.get("/exercise/categories", ensureAuthenticated, listCategories);
  app.get("/exercise/muscle-groups", ensureAuthenticated, listMuscleGroups);
  app.get("/exercise/muscle-groups/:muscleGroupId/exercises", ensureAuthenticated, byMuscleGroup);
  app.get("/exercise/search", ensureAuthenticated, searchExercises);
  app.get("/exercise/my-exercises", ensureAuthenticated, myExercises);
  app.get("/exercise/:exerciseId", ensureAuthenticated, getExercise);
  app.get("/exercise", ensureAuthenticated, listExercises);
  app.post("/exercise", ensureAuthenticated, createExercise);
  app.put("/exercise/:exerciseId", ensureAuthenticated, updateExercise);
  app.patch("/exercise/:exerciseId/media", ensureAuthenticated, patchMedia);
  app.delete("/exercise/:exerciseId", ensureAuthenticated, removeExerciseController);

  app.get("/routine/near-expiry", ensureAuthenticated, nearExpiry);
  app.get("/routine/my-routines", ensureAuthenticated, myRoutines);
  app.get("/routine/my-assigned-routines", ensureAuthenticated, myAssignedRoutines);
  app.get("/routine/customer/:customerId", ensureAuthenticated, customerRoutinesHandler);
  app.get("/routine/:routineId/customers", ensureAuthenticated, routineCustomers);
  app.put("/routine/:routineId/customer/:customerId/expiry", ensureAuthenticated, updateExpiry);
  app.delete("/routine/:routineId/customer/:customerId", ensureAuthenticated, unassign);
  app.post("/routine/assign", ensureAuthenticated, assign);
  app.get("/routine/:routineId", ensureAuthenticated, getRoutine);
  app.post("/routine", ensureAuthenticated, createRoutine);
  app.put("/routine/:routineId", ensureAuthenticated, updateRoutine);
  app.delete("/routine/:routineId", ensureAuthenticated, removeRoutine);

  app.post("/workoutTemplate/routine/:routineId", ensureAuthenticated, createProTemplate);
  app.get("/workoutTemplate/routine/:routineId", ensureAuthenticated, byRoutine);
  app.get("/workoutTemplate/:templateId", ensureAuthenticated, getProTemplate);
  app.put("/workoutTemplate/:templateId", ensureAuthenticated, updateProTemplate);
  app.delete("/workoutTemplate/:templateId", ensureAuthenticated, removeProTemplate);
  app.post("/workoutTemplate/:templateId/exercises", ensureAuthenticated, addExercise);
  app.put("/workoutTemplate/exercise/:exerciseTemplateId", ensureAuthenticated, updateExerciseTemplate);
  app.delete("/workoutTemplate/exercise/:exerciseTemplateId", ensureAuthenticated, removeExerciseTemplateController);
  app.put("/workoutTemplate/:templateId/reorder", ensureAuthenticated, reorder);

  app.post("/appointment", ensureAuthenticated, createAppointment);
  app.get("/appointment", ensureAuthenticated, listAppointments);
  app.put("/appointment/:id", ensureAuthenticated, updateAppointment);
  app.delete("/appointment/:id", ensureAuthenticated, removeAppointment);

  app.post("/feedback", ensureAuthenticated, createFeedback);
  app.get("/feedback", ensureAuthenticated, listByProfessional);
  app.get("/feedback/:id", ensureAuthenticated, getFeedback);

  app.post("/Favorite/:professionalId", ensureAuthenticated, (req, _res, next) => {
    req.body = { professionalId: req.params.professionalId };
    return next();
  }, addFavorite);
  app.delete("/Favorite/:professionalId", ensureAuthenticated, removeFavorite);
  app.get("/Favorite", ensureAuthenticated, listFavorites);

  app.post("/push/Subscribe", ensureAuthenticated, subscribeHandler);
  app.post("/push/Unsubscribe", ensureAuthenticated, (req, _res, next) => {
    if (typeof req.body === "string") {
      req.body = { endpoint: req.body };
    }
    return next();
  }, unsubscribeHandler);

  // Storage
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single("file");
  app.post("/storage/upload", ensureAuthenticated, upload, uploadImageHandler);
  app.post("/storage/exercise/:exerciseId", ensureAuthenticated, upload, uploadExerciseMediaHandler);
  app.delete("/storage/exercise/:exerciseId", ensureAuthenticated, deleteExerciseMediaHandler);
  app.delete("/storage/:objectName", ensureAuthenticated, deleteImageHandler);
  app.get("/storage/presigned-url/:objectName", ensureAuthenticated, getPresignedUrlHandler);

  app.use(errorHandler);

  return app;
}
