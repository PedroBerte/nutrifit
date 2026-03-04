import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import {
  create, getById, byRoutine, update, remove,
  addExercise, updateExercise, removeExercise, reorder,
} from "./pro-workout-templates.controller";

const router = Router();

// Modern routes
router.post("/workout-templates/routine/:routineId", ensureAuthenticated, create);
router.get("/workout-templates/routine/:routineId", ensureAuthenticated, byRoutine);
router.get("/workout-templates/:templateId", ensureAuthenticated, getById);
router.put("/workout-templates/:templateId", ensureAuthenticated, update);
router.delete("/workout-templates/:templateId", ensureAuthenticated, remove);
router.post("/workout-templates/:templateId/exercises", ensureAuthenticated, addExercise);
router.put("/workout-templates/exercise/:exerciseTemplateId", ensureAuthenticated, updateExercise);
router.delete("/workout-templates/exercise/:exerciseTemplateId", ensureAuthenticated, removeExercise);
router.put("/workout-templates/:templateId/reorder", ensureAuthenticated, reorder);

export default router;
