import { Router } from "express";
import {
  loginSelfManaged, registerSelfManaged,
  sendMagicLinkHandler, validateMagicLinkHandler,
} from "./auth.controller";

const router = Router();

router.post("/auth/self-managed/register", registerSelfManaged);
router.post("/auth/self-managed/login", loginSelfManaged);
router.post("/auth/magic-link/send", sendMagicLinkHandler);
router.post("/auth/magic-link/validate", validateMagicLinkHandler);

export default router;
