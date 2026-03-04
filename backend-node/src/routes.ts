import { Router } from "express";
import healthRouter from "./modules/health/health.routes";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";
import selfManagedRouter from "./modules/self-managed/self-managed.routes";
import bondsRouter from "./modules/bonds/bonds.routes";
import exercisesRouter from "./modules/exercises/exercises.routes";
import routinesRouter from "./modules/routines/routines.routes";
import proWorkoutTemplatesRouter from "./modules/pro-workout-templates/pro-workout-templates.routes";
import proWorkoutSessionsRouter from "./modules/pro-workout-sessions/pro-workout-sessions.routes";
import favoritesRouter from "./modules/favorites/favorites.routes";
import feedbackRouter from "./modules/feedback/feedback.routes";
import appointmentsRouter from "./modules/appointments/appointments.routes";
import pushRouter from "./modules/push/push.routes";
import storageRouter from "./modules/storage/storage.routes";
import workoutSessionsRouter from "./modules/workout-sessions.routes";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(selfManagedRouter);
router.use(usersRouter);
router.use(bondsRouter);
router.use(exercisesRouter);
router.use(routinesRouter);
router.use(proWorkoutTemplatesRouter);
router.use(proWorkoutSessionsRouter);
router.use(favoritesRouter);
router.use(feedbackRouter);
router.use(appointmentsRouter);
router.use(pushRouter);
router.use(storageRouter);
router.use(workoutSessionsRouter);

export default router;
