import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import {
  create, update, remove, getById, myRoutines, assign, unassign,
  myAssignedRoutines, customerRoutinesHandler, routineCustomers, nearExpiry, updateExpiry,
} from "./routines.controller";

const router = Router();

// Modern routes
router.get("/routines/near-expiry", ensureAuthenticated, nearExpiry);
router.get("/routines/my-routines", ensureAuthenticated, myRoutines);
router.get("/routines/my-assigned-routines", ensureAuthenticated, myAssignedRoutines);
router.get("/routines/customer/:customerId", ensureAuthenticated, customerRoutinesHandler);
router.get("/routines/:routineId/customers", ensureAuthenticated, routineCustomers);
router.put("/routines/:routineId/customer/:customerId/expiry", ensureAuthenticated, updateExpiry);
router.delete("/routines/:routineId/customer/:customerId", ensureAuthenticated, unassign);
router.post("/routines/assign", ensureAuthenticated, assign);
router.get("/routines/:routineId", ensureAuthenticated, getById);
router.get("/routines", ensureAuthenticated, myRoutines);
router.post("/routines", ensureAuthenticated, create);
router.put("/routines/:routineId", ensureAuthenticated, update);
router.delete("/routines/:routineId", ensureAuthenticated, remove);

export default router;
