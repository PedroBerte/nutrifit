import { Router } from "express";
import multer from "multer";
import { ensureAuthenticated } from "../auth/auth.middleware";
import {
  uploadImageHandler, uploadExerciseMediaHandler, deleteExerciseMediaHandler,
  deleteImageHandler, getPresignedUrlHandler,
} from "./storage.controller";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single("file");

const router = Router();

router.post("/storage/upload", ensureAuthenticated, upload, uploadImageHandler);
router.post("/storage/exercise/:exerciseId", ensureAuthenticated, upload, uploadExerciseMediaHandler);
router.delete("/storage/exercise/:exerciseId", ensureAuthenticated, deleteExerciseMediaHandler);
router.delete("/storage/:objectName", ensureAuthenticated, deleteImageHandler);
router.get("/storage/presigned-url/:objectName", ensureAuthenticated, getPresignedUrlHandler);

export default router;
