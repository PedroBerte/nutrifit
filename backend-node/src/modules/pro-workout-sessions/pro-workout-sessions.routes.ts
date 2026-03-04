import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import { start, list, getById, finish } from "./pro-workout-sessions.controller";

const router = Router();

router.post("/pro-sessions", ensureAuthenticated, start);
router.get("/pro-sessions", ensureAuthenticated, list);
router.get("/pro-sessions/:sessionId", ensureAuthenticated, getById);
router.post("/pro-sessions/:sessionId/finish", ensureAuthenticated, finish);

export default router;
