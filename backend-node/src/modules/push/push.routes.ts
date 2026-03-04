import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import { subscribeHandler, unsubscribeHandler } from "./push.controller";

const router = Router();

// Modern routes
router.post("/push/subscribe", ensureAuthenticated, subscribeHandler);
router.delete("/push/unsubscribe", ensureAuthenticated, unsubscribeHandler);
router.post("/push/unsubscribe", ensureAuthenticated, (req, _res, next) => {
	if (typeof req.body === "string") {
		req.body = { endpoint: req.body };
	}
	return next();
}, unsubscribeHandler);

export default router;
