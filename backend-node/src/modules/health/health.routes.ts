import { Router } from "express";
import { getHealth } from "./health.controller";

const router = Router();

router.get("/health", getHealth);

export default router;
