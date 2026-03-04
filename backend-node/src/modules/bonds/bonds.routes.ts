import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import {
  listBonds, getBond, sentBonds, receivedBonds, bondsAsCustomer,
  bondsAsProfessional, myBonds, activeStudents, createBondHandler,
  updateBondHandler, deleteBondHandler,
} from "./bonds.controller";

const router = Router();

// Modern routes
router.get("/bonds/sent", ensureAuthenticated, sentBonds);
router.get("/bonds/received", ensureAuthenticated, receivedBonds);
router.get("/bonds/as-customer", ensureAuthenticated, bondsAsCustomer);
router.get("/bonds/as-professional", ensureAuthenticated, bondsAsProfessional);
router.get("/bonds/my-bonds", ensureAuthenticated, myBonds);
router.get("/bonds/active-students", ensureAuthenticated, activeStudents);
router.get("/bonds/:id", ensureAuthenticated, getBond);
router.get("/bonds", ensureAuthenticated, listBonds);
router.post("/bonds", ensureAuthenticated, createBondHandler);
router.put("/bonds/:id", ensureAuthenticated, updateBondHandler);
router.delete("/bonds/:id", ensureAuthenticated, deleteBondHandler);

export default router;
