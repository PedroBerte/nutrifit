#!/usr/bin/env node
// Run after init-structure.js: adds storage module, unit tests, patches app.ts,
// and fixes lib/prisma paths + Zod v4 syntax in all generated files.
// Usage: npm run setup  (package.json runs both scripts)

const fs = require("fs");
const path = require("path");

const root = __dirname;

function writeFile(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (!fs.existsSync(abs)) {
    fs.writeFileSync(abs, content, "utf8");
    console.log("  created:", relPath);
  } else {
    console.log("  exists (skipped):", relPath);
  }
}

function patchFile(relPath, patches) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) {
    console.log("  not found (skip patch):", relPath);
    return;
  }
  let content = fs.readFileSync(abs, "utf8");
  let modified = false;
  for (const [from, to] of patches) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      modified = true;
    }
  }
  if (modified) {
    fs.writeFileSync(abs, content, "utf8");
    console.log("  patched:", relPath);
  } else {
    console.log("  already patched (skipped):", relPath);
  }
}

// ─── storage module ──────────────────────────────────────────────────────────

writeFile(
  "src/modules/storage/storage.service.ts",
  `import * as Minio from "minio";
import { AppError } from "../../common/app-error";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

let _client: Minio.Client | null = null;

function getClient(): Minio.Client {
  if (!_client) {
    _client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY ?? "admin",
      secretKey: process.env.MINIO_SECRET_KEY ?? "admin123",
    });
  }
  return _client;
}

const BUCKET = process.env.MINIO_BUCKET ?? "nutrifit";

export async function ensureBucket(): Promise<void> {
  const client = getClient();
  const exists = await client.bucketExists(BUCKET);
  if (!exists) {
    await client.makeBucket(BUCKET);
    const policy = JSON.stringify({
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [\`arn:aws:s3:::\${BUCKET}/*\`] }],
    });
    await client.setBucketPolicy(BUCKET, policy);
  }
}

export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  folder = "uploads"
): Promise<string> {
  if (!ALLOWED_TYPES.includes(mimeType)) throw new AppError("File type not allowed", 400);
  if (buffer.length > MAX_SIZE_BYTES) throw new AppError("File too large (max 5MB)", 400);
  const ext = originalName.split(".").pop() ?? "jpg";
  const objectName = \`\${folder}/\${Date.now()}-\${Math.random().toString(36).slice(2)}.\${ext}\`;
  await getClient().putObject(BUCKET, objectName, buffer, buffer.length, { "Content-Type": mimeType });
  const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
  const port = process.env.MINIO_PORT ?? "9000";
  const ssl = process.env.MINIO_USE_SSL === "true";
  return \`\${ssl ? "https" : "http"}://\${endpoint}:\${port}/\${BUCKET}/\${objectName}\`;
}

export async function deleteFile(objectName: string): Promise<void> {
  await getClient().removeObject(BUCKET, objectName);
}

export async function getPresignedUrl(objectName: string, expirySeconds = 3600): Promise<string> {
  return getClient().presignedGetObject(BUCKET, objectName, expirySeconds);
}
`
);

writeFile(
  "src/modules/storage/storage.controller.ts",
  `import { Request, Response } from "express";
import { AppError } from "../../common/app-error";
import { deleteFile, getPresignedUrl, uploadFile } from "./storage.service";
import { prisma } from "../../prisma";

export async function uploadImageHandler(req: Request, res: Response) {
  const file = (req as any).file as { buffer: Buffer; mimetype: string; originalname: string } | undefined;
  if (!file) throw new AppError("No file provided", 400);
  const url = await uploadFile(file.buffer, file.mimetype, file.originalname);
  return res.status(200).json({ url });
}

export async function uploadExerciseMediaHandler(req: Request, res: Response) {
  const file = (req as any).file as { buffer: Buffer; mimetype: string; originalname: string } | undefined;
  if (!file) throw new AppError("No file provided", 400);
  const url = await uploadFile(file.buffer, file.mimetype, file.originalname, "exercises");
  await prisma.exercise.update({ where: { id: req.params.exerciseId }, data: { imageUrl: url } });
  return res.status(200).json({ url });
}

export async function deleteExerciseMediaHandler(req: Request, res: Response) {
  const exercise = await prisma.exercise.findUnique({ where: { id: req.params.exerciseId } });
  if (!exercise?.imageUrl) throw new AppError("Exercise has no media", 404);
  const objectName = exercise.imageUrl.split("/").slice(-2).join("/");
  await deleteFile(objectName);
  await prisma.exercise.update({ where: { id: req.params.exerciseId }, data: { imageUrl: null } });
  return res.status(204).send();
}

export async function deleteImageHandler(req: Request, res: Response) {
  await deleteFile(decodeURIComponent(req.params.objectName));
  return res.status(204).send();
}

export async function getPresignedUrlHandler(req: Request, res: Response) {
  const url = await getPresignedUrl(decodeURIComponent(req.params.objectName));
  return res.status(200).json({ url });
}
`
);

// ─── unit tests ──────────────────────────────────────────────────────────────

writeFile(
  "tests/unit/exercises.service.spec.ts",
  `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    exercise: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    exerciseCategory: { findMany: vi.fn() },
    muscleGroup: { findMany: vi.fn() },
  },
}));

import { prisma } from "../../src/prisma";
import {
  getExerciseById,
  createExercise,
  getCategories,
} from "../../src/modules/exercises/exercises.service";

describe("exercises.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getExerciseById throws 404 when exercise not found", async () => {
    vi.mocked(prisma.exercise.findUnique).mockResolvedValue(null);
    await expect(getExerciseById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("createExercise creates and returns exercise", async () => {
    const mockEx = {
      id: "ex-1",
      name: "Supino",
      status: "A",
      createdByUserId: "u-1",
      categoryId: "c-1",
      instruction: null,
      imageUrl: null,
      videoUrl: null,
      isPublished: false,
      primaryMuscles: [],
      secondaryMuscles: [],
      category: { id: "c-1", name: "Força", status: "A" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.exercise.create).mockResolvedValue(mockEx as any);
    const result = await createExercise("u-1", { name: "Supino", categoryId: "c-1" });
    expect(result.name).toBe("Supino");
  });

  it("getCategories returns array from prisma", async () => {
    vi.mocked(prisma.exerciseCategory.findMany).mockResolvedValue([
      { id: "c-1", name: "Cardio", status: "A" },
    ] as any);
    const result = await getCategories();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe("Cardio");
  });
});
`
);

writeFile(
  "tests/unit/routines.service.spec.ts",
  `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    routine: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    customerRoutine: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/prisma";
import {
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../../src/modules/routines/routines.service";

describe("routines.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getRoutineById throws 404 when routine not found", async () => {
    vi.mocked(prisma.routine.findUnique).mockResolvedValue(null);
    await expect(getRoutineById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("updateRoutine throws 403 for non-owner", async () => {
    vi.mocked(prisma.routine.findFirst).mockResolvedValue(null);
    await expect(updateRoutine("r-1", "other-user", { title: "X" })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("deleteRoutine throws 403 for non-owner", async () => {
    vi.mocked(prisma.routine.findFirst).mockResolvedValue(null);
    await expect(deleteRoutine("r-1", "other-user")).rejects.toMatchObject({ statusCode: 403 });
  });

  it("createRoutine returns routine", async () => {
    const mock = {
      id: "r-1",
      personalId: "p-1",
      title: "Hipertrofia",
      goal: null,
      difficulty: null,
      weeks: null,
      status: "A",
      workoutTemplates: [],
      customerRoutines: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.routine.create).mockResolvedValue(mock as any);
    const result = await createRoutine("p-1", { title: "Hipertrofia" });
    expect(result.title).toBe("Hipertrofia");
  });
});
`
);

writeFile(
  "tests/unit/bonds.service.spec.ts",
  `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prisma", () => ({
  prisma: {
    customerProfessionalBond: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/prisma";
import { getBondById, getBondsByUser, createBond } from "../../src/modules/bonds/bonds.service";

describe("bonds.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getBondById throws 404 when bond not found", async () => {
    vi.mocked(prisma.customerProfessionalBond.findUnique).mockResolvedValue(null);
    await expect(getBondById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("getBondsByUser returns empty array for new user", async () => {
    vi.mocked(prisma.customerProfessionalBond.findMany).mockResolvedValue([]);
    const result = await getBondsByUser("user-1");
    expect(result).toEqual([]);
  });

  it("createBond creates and returns bond", async () => {
    const mock = {
      id: "b-1",
      customerId: "c-1",
      professionalId: "p-1",
      senderId: "p-1",
      status: "P",
      customer: null,
      professional: null,
      sender: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.customerProfessionalBond.create).mockResolvedValue(mock as any);
    const result = await createBond({ customerId: "c-1", professionalId: "p-1", senderId: "p-1" });
    expect(result.status).toBe("P");
  });
});
`
);

// ─── patch app.ts to add storage routes ──────────────────────────────────────

console.log("\nPatching src/app.ts to add storage routes...");

patchFile("src/app.ts", [
  [
    `// Push\nimport { subscribeHandler, unsubscribeHandler } from "./modules/push/push.controller";\n\nexport function createApp() {`,
    `// Push\nimport { subscribeHandler, unsubscribeHandler } from "./modules/push/push.controller";\n\n// Storage\nimport multer from "multer";\nimport {\n  deleteExerciseMediaHandler,\n  deleteImageHandler,\n  getPresignedUrlHandler,\n  uploadExerciseMediaHandler,\n  uploadImageHandler,\n} from "./modules/storage/storage.controller";\n\nexport function createApp() {`,
  ],
  [
    `  app.delete("/push/unsubscribe", ensureAuthenticated, unsubscribeHandler);\n\n  app.use(errorHandler);`,
    `  app.delete("/push/unsubscribe", ensureAuthenticated, unsubscribeHandler);\n\n  // Storage\n  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single("file");\n  app.post("/storage/upload", ensureAuthenticated, upload, uploadImageHandler);\n  app.post("/storage/exercise/:exerciseId", ensureAuthenticated, upload, uploadExerciseMediaHandler);\n  app.delete("/storage/exercise/:exerciseId", ensureAuthenticated, deleteExerciseMediaHandler);\n  app.delete("/storage/:objectName", ensureAuthenticated, deleteImageHandler);\n  app.get("/storage/presigned-url/:objectName", ensureAuthenticated, getPresignedUrlHandler);\n\n  app.use(errorHandler);`,
  ],
]);

// ─── fixup: correct lib/prisma paths and Zod v4 syntax ───────────────────────

console.log("\nFixing lib/prisma imports and Zod v4 syntax in generated files...");

function fixupFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixupFiles(full);
    } else if (entry.name.endsWith(".ts")) {
      let content = fs.readFileSync(full, "utf8");
      const original = content;
      content = content
        // Fix wrong prisma import paths
        .replace(/from "\.\.\/\.\.\/lib\/prisma"/g, 'from "../../prisma"')
        .replace(/from "\.\.\/\.\.\/\.\.\/lib\/prisma"/g, 'from "../../../prisma"')
        .replace(/from "\.\.\/\.\.\/src\/lib\/prisma"/g, 'from "../../src/prisma"')
        // Fix Zod v3 → v4 validators (z.string().email() etc. removed in Zod v4)
        .replace(/z\.string\(\)\.email\(\)/g, "z.email()")
        .replace(/z\.string\(\)\.url\(\)/g, "z.url()")
        .replace(/z\.string\(\)\.uuid\(\)/g, "z.uuid()")
        .replace(/z\.string\(\)\.datetime\(\)/g, "z.iso.datetime()");
      if (content !== original) {
        fs.writeFileSync(full, content, "utf8");
        console.log("  fixed:", path.relative(root, full));
      }
    }
  }
}

fixupFiles(path.join(root, "src"));
fixupFiles(path.join(root, "tests"));

console.log("\nsetup-add-modules.js completed successfully!");
console.log("Required npm packages (not yet installed):");
console.log("  npm install minio multer web-push");
console.log("  npm install -D @types/multer @types/web-push");
console.log("\nNext steps:");
console.log("  1. npm install minio multer web-push");
console.log("  2. npm install -D @types/multer @types/web-push");
console.log("  3. npx prisma generate");
console.log("  4. npx prisma migrate dev --name init  (requires running PostgreSQL)");
console.log("  5. npx prisma db seed");
console.log("  6. npm test:unit");
