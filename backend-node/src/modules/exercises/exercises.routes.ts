import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import {
  list, search, getById, listCategories, listMuscleGroups, byMuscleGroup,
  create, update, patchMedia, remove, myExercises,
} from "./exercises.controller";

const router = Router();

// Modern routes
router.get("/exercises/categories", ensureAuthenticated, listCategories);
router.get("/exercises/muscle-groups", ensureAuthenticated, listMuscleGroups);
router.get("/exercises/muscle-groups/:muscleGroupId/exercises", ensureAuthenticated, byMuscleGroup);
router.get("/exercises/search", ensureAuthenticated, search);
router.get("/exercises/my-exercises", ensureAuthenticated, myExercises);
router.get("/exercises/:exerciseId", ensureAuthenticated, getById);
router.get("/exercises", ensureAuthenticated, list);
router.post("/exercises", ensureAuthenticated, create);
router.put("/exercises/:exerciseId", ensureAuthenticated, update);
router.patch("/exercises/:exerciseId/media", ensureAuthenticated, patchMedia);
router.delete("/exercises/:exerciseId", ensureAuthenticated, remove);

export default router;
