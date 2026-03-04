import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import {
  getMyProfile, updateMyProfile,
  listMyWorkoutTemplates, createMyWorkoutTemplate, getMyWorkoutTemplate,
  updateMyWorkoutTemplate, deleteMyWorkoutTemplate,
  listMyWorkoutSessions, startMyWorkoutSession, getMyWorkoutSession, finishMyWorkoutSession,
  getMyWeeklyGoal, upsertMyWeeklyGoal, getMyWeeklyProgress,
} from "./self-managed.controller";

const router = Router();

router.get("/workouts/templates", ensureAuthenticated, listMyWorkoutTemplates);
router.post("/workouts/templates", ensureAuthenticated, createMyWorkoutTemplate);
router.get("/workouts/templates/:workoutId", ensureAuthenticated, getMyWorkoutTemplate);
router.put("/workouts/templates/:workoutId", ensureAuthenticated, updateMyWorkoutTemplate);
router.delete("/workouts/templates/:workoutId", ensureAuthenticated, deleteMyWorkoutTemplate);

router.get("/workouts/sessions", ensureAuthenticated, listMyWorkoutSessions);
router.post("/workouts/sessions", ensureAuthenticated, startMyWorkoutSession);
router.get("/workouts/sessions/:sessionId", ensureAuthenticated, getMyWorkoutSession);
router.post("/workouts/sessions/:sessionId/finish", ensureAuthenticated, finishMyWorkoutSession);

router.get("/goals/weekly", ensureAuthenticated, getMyWeeklyGoal);
router.put("/goals/weekly", ensureAuthenticated, upsertMyWeeklyGoal);
router.get("/goals/weekly/progress", ensureAuthenticated, getMyWeeklyProgress);

export default router;
