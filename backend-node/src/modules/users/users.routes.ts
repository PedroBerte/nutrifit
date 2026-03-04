import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import {
	listUsers,
	getUser,
	updateUserHandler,
	deleteUserHandler,
	getUserFeedbacks,
	createUserHandler,
	geocodeAllAddressesHandler,
} from "./users.controller";
import { getMyProfile, updateMyProfile } from "../self-managed/self-managed.controller";

const router = Router();

// Self-managed profile – must come before /:id
router.get("/users/me", ensureAuthenticated, getMyProfile);
router.put("/users/me", ensureAuthenticated, updateMyProfile);

router.post("/users", ensureAuthenticated, createUserHandler);
router.post("/users/geocode-addresses", ensureAuthenticated, geocodeAllAddressesHandler);
router.get("/users", ensureAuthenticated, listUsers);
router.get("/users/:id/feedbacks", ensureAuthenticated, getUserFeedbacks);
router.get("/users/:id", ensureAuthenticated, getUser);
router.put("/users/:id", ensureAuthenticated, updateUserHandler);
router.delete("/users/:id", ensureAuthenticated, deleteUserHandler);

export default router;
