import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import { create, list, update, remove } from "./appointments.controller";

const router = Router();

// Modern routes
router.post("/appointments", ensureAuthenticated, create);
router.get("/appointments", ensureAuthenticated, list);
router.put("/appointments/:id", ensureAuthenticated, update);
router.delete("/appointments/:id", ensureAuthenticated, remove);

export default router;
