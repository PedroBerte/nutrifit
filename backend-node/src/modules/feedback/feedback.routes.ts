import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import { create, listByProfessional, getById } from "./feedback.controller";

const router = Router();

// Modern routes
router.post("/feedbacks", ensureAuthenticated, create);
router.get("/feedbacks", ensureAuthenticated, listByProfessional);
router.get("/feedbacks/:id", ensureAuthenticated, getById);

export default router;
