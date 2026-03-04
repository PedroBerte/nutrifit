const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\mauri\\source\\repos\\nutrifit\\backend-node';

function write(relPath, content) {
  const abs = path.join(BASE, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (!fs.existsSync(abs)) {
    fs.writeFileSync(abs, content, 'utf8');
    console.log('  created:', relPath);
  } else {
    console.log('  exists (skipped):', relPath);
  }
}

// ─── user module ────────────────────────────────────────────────────────────

write('src/modules/user/user.types.ts', `export interface UserRecord {
  id: string;
  name: string;
  email: string;
  sex: string;
  dateOfBirth: string;
  phoneNumber: string;
  imageUrl: string | null;
  isAdmin: boolean;
  status: string;
  profileId: string;
  profile: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  profileId: string;
  sex?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

export interface UpdateUserInput {
  name?: string;
  sex?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  imageUrl?: string;
}
`);

write('src/modules/user/user.schemas.ts', `import { z } from "zod";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  profileId: z.uuid(),
  sex: z.string().max(1).optional(),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().max(20).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  sex: z.string().max(1).optional(),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().max(20).optional(),
  imageUrl: z.url().optional(),
});
`);

write('src/modules/user/user.store.ts', `import { prisma } from "../../prisma";
import { CreateUserInput, ListUsersParams, UpdateUserInput, UserRecord } from "./user.types";

function toUserRecord(user: {
  id: string;
  name: string;
  email: string;
  sex: string;
  dateOfBirth: Date;
  phoneNumber: string;
  imageUrl: string | null;
  isAdmin: boolean;
  status: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date | null;
  profile?: { id: string; name: string; status: string } | null;
}): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    sex: user.sex,
    dateOfBirth: user.dateOfBirth.toISOString(),
    phoneNumber: user.phoneNumber,
    imageUrl: user.imageUrl,
    isAdmin: user.isAdmin,
    status: user.status,
    profileId: user.profileId,
    profile: user.profile ? { id: user.profile.id, name: user.profile.name } : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: (user.updatedAt ?? user.createdAt).toISOString(),
  };
}

export async function listUsers(
  params: ListUsersParams
): Promise<{ data: UserRecord[]; total: number }> {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        status: "A",
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { status: "A" };

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: rows.map(toUserRecord), total };
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
  return user ? toUserRecord(user) : undefined;
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { profile: true },
  });
  return user ? toUserRecord(user) : undefined;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      profileId: input.profileId,
      sex: input.sex ?? "",
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : new Date(),
      phoneNumber: input.phoneNumber ?? "",
      isAdmin: false,
      status: "A",
    },
    include: { profile: true },
  });
  return toUserRecord(user);
}

export async function updateUser(id: string, changes: UpdateUserInput): Promise<UserRecord> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(changes.name !== undefined ? { name: changes.name.trim() } : {}),
      ...(changes.sex !== undefined ? { sex: changes.sex } : {}),
      ...(changes.dateOfBirth !== undefined ? { dateOfBirth: new Date(changes.dateOfBirth) } : {}),
      ...(changes.phoneNumber !== undefined ? { phoneNumber: changes.phoneNumber } : {}),
      ...(changes.imageUrl !== undefined ? { imageUrl: changes.imageUrl } : {}),
    },
    include: { profile: true },
  });
  return toUserRecord(user);
}

export async function softDeleteUser(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { status: "I" },
  });
}
`);

write('src/modules/user/user.service.ts', `import { AppError } from "../../common/app-error";
import {
  createUser as createUserInStore,
  findUserById as findUserByIdInStore,
  findUserByEmail as findUserByEmailInStore,
  listUsers as listUsersInStore,
  softDeleteUser as softDeleteUserInStore,
  updateUser as updateUserInStore,
} from "./user.store";
import { CreateUserInput, ListUsersParams, UpdateUserInput } from "./user.types";

export async function getUsers(params: ListUsersParams) {
  return listUsersInStore(params);
}

export async function getUserById(id: string) {
  const user = await findUserByIdInStore(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function createUser(input: CreateUserInput) {
  const existing = await findUserByEmailInStore(input.email);
  if (existing) {
    throw new AppError("Email already in use", 409);
  }
  return createUserInStore(input);
}

export async function updateUser(
  requesterId: string,
  targetId: string,
  changes: UpdateUserInput,
  isAdmin: boolean
) {
  if (!isAdmin && requesterId !== targetId) {
    throw new AppError("Forbidden", 403);
  }
  await getUserById(targetId);
  return updateUserInStore(targetId, changes);
}

export async function deleteUser(id: string) {
  await getUserById(id);
  await softDeleteUserInStore(id);
}
`);

write('src/modules/user/user.controller.ts', `import { Request, Response } from "express";

import { AppError } from "../../common/app-error";
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from "./user.schemas";
import { createUser, deleteUser, getUsers, getUserById, updateUser } from "./user.service";

function getIdParam(request: Request): string {
  const { id } = request.params;
  return Array.isArray(id) ? id[0] : id;
}

export async function listUsers(request: Request, response: Response) {
  if (!request.user?.isAdmin) {
    throw new AppError("Forbidden", 403);
  }
  const query = listUsersQuerySchema.parse(request.query);
  const result = await getUsers(query);
  return response.status(200).json({
    data: result.data,
    total: result.total,
    page: query.page,
    limit: query.limit,
  });
}

export async function getUserByIdHandler(request: Request, response: Response) {
  const user = await getUserById(getIdParam(request));
  return response.status(200).json(user);
}

export async function updateUserById(request: Request, response: Response) {
  const targetId = getIdParam(request);
  const requesterId = request.user!.id;
  const isAdmin = request.user!.isAdmin;
  const payload = updateUserSchema.parse(request.body);
  const updated = await updateUser(requesterId, targetId, payload, isAdmin);
  return response.status(200).json(updated);
}

export async function createUserHandler(request: Request, response: Response) {
  if (!request.user?.isAdmin) {
    throw new AppError("Forbidden", 403);
  }
  const payload = createUserSchema.parse(request.body);
  const user = await createUser(payload);
  return response.status(201).json(user);
}

export async function deleteUserHandler(request: Request, response: Response) {
  if (!request.user?.isAdmin) {
    throw new AppError("Forbidden", 403);
  }
  await deleteUser(getIdParam(request));
  return response.status(204).send();
}
`);

// ─── profile module ──────────────────────────────────────────────────────────

write('src/modules/profile/profile.types.ts', `export interface ProfileRecord {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
`);

write('src/modules/profile/profile.schemas.ts', `import { z } from "zod";

export const createProfileSchema = z.object({
  name: z.string().min(2).max(80),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80),
});
`);

write('src/modules/profile/profile.store.ts', `import { prisma } from "../../prisma";
import { ProfileRecord } from "./profile.types";

function toProfileRecord(profile: {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
}): ProfileRecord {
  return {
    id: profile.id,
    name: profile.name,
    status: profile.status,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: (profile.updatedAt ?? profile.createdAt).toISOString(),
  };
}

export async function listProfiles(): Promise<ProfileRecord[]> {
  const rows = await prisma.profile.findMany({
    where: { status: "A" },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProfileRecord);
}

export async function findProfileById(id: string): Promise<ProfileRecord | undefined> {
  const profile = await prisma.profile.findUnique({ where: { id } });
  return profile ? toProfileRecord(profile) : undefined;
}

export async function createProfile(name: string): Promise<ProfileRecord> {
  const profile = await prisma.profile.create({
    data: { name: name.trim(), status: "A" },
  });
  return toProfileRecord(profile);
}

export async function updateProfile(id: string, name: string): Promise<ProfileRecord> {
  const profile = await prisma.profile.update({
    where: { id },
    data: { name: name.trim() },
  });
  return toProfileRecord(profile);
}

export async function softDeleteProfile(id: string): Promise<void> {
  await prisma.profile.update({
    where: { id },
    data: { status: "I" },
  });
}
`);

write('src/modules/profile/profile.service.ts', `import { AppError } from "../../common/app-error";
import {
  createProfile as createProfileInStore,
  findProfileById as findProfileByIdInStore,
  listProfiles as listProfilesInStore,
  softDeleteProfile as softDeleteProfileInStore,
  updateProfile as updateProfileInStore,
} from "./profile.store";
import { prisma } from "../../prisma";

export async function listProfiles() {
  return listProfilesInStore();
}

export async function getProfileById(id: string) {
  const profile = await findProfileByIdInStore(id);
  if (!profile) {
    throw new AppError("Profile not found", 404);
  }
  return profile;
}

export async function createProfile(name: string) {
  const existing = await prisma.profile.findUnique({ where: { name: name.trim() } });
  if (existing) {
    throw new AppError("Profile name already in use", 409);
  }
  return createProfileInStore(name);
}

export async function updateProfile(id: string, name: string) {
  await getProfileById(id);
  const existing = await prisma.profile.findFirst({
    where: { name: name.trim(), id: { not: id } },
  });
  if (existing) {
    throw new AppError("Profile name already in use", 409);
  }
  return updateProfileInStore(id, name);
}

export async function deleteProfile(id: string) {
  await getProfileById(id);
  await softDeleteProfileInStore(id);
}
`);

write('src/modules/profile/profile.controller.ts', `import { Request, Response } from "express";

import { AppError } from "../../common/app-error";
import { createProfileSchema, updateProfileSchema } from "./profile.schemas";
import {
  createProfile,
  deleteProfile,
  getProfileById,
  listProfiles,
  updateProfile,
} from "./profile.service";

function getIdParam(request: Request): string {
  const { id } = request.params;
  return Array.isArray(id) ? id[0] : id;
}

export async function listProfilesHandler(request: Request, response: Response) {
  const profiles = await listProfiles();
  return response.status(200).json(profiles);
}

export async function getProfileByIdHandler(request: Request, response: Response) {
  const profile = await getProfileById(getIdParam(request));
  return response.status(200).json(profile);
}

export async function createProfileHandler(request: Request, response: Response) {
  if (!request.user?.isAdmin) {
    throw new AppError("Forbidden", 403);
  }
  const { name } = createProfileSchema.parse(request.body);
  const profile = await createProfile(name);
  return response.status(201).json(profile);
}

export async function updateProfileHandler(request: Request, response: Response) {
  if (!request.user?.isAdmin) {
    throw new AppError("Forbidden", 403);
  }
  const { name } = updateProfileSchema.parse(request.body);
  const profile = await updateProfile(getIdParam(request), name);
  return response.status(200).json(profile);
}

export async function deleteProfileHandler(request: Request, response: Response) {
  if (!request.user?.isAdmin) {
    throw new AppError("Forbidden", 403);
  }
  await deleteProfile(getIdParam(request));
  return response.status(204).send();
}
`);

// ─── unit tests ──────────────────────────────────────────────────────────────

write('tests/unit/user.service.spec.ts', `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/user/user.store");

import * as userStore from "../../src/modules/user/user.store";
import { AppError } from "../../src/common/app-error";
import {
  createUser,
  deleteUser,
  getUsers,
  getUserById,
  updateUser,
} from "../../src/modules/user/user.service";

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  sex: "",
  dateOfBirth: new Date().toISOString(),
  phoneNumber: "",
  imageUrl: null,
  isAdmin: false,
  status: "A",
  profileId: "profile-1",
  profile: { id: "profile-1", name: "SelfManaged" },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("user.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("returns paginated list", async () => {
      vi.mocked(userStore.listUsers).mockResolvedValue({ data: [mockUser], total: 1 });

      const result = await getUsers({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(userStore.listUsers).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe("getUserById", () => {
    it("throws 404 for unknown user", async () => {
      vi.mocked(userStore.findUserById).mockResolvedValue(undefined);

      await expect(getUserById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("updateUser", () => {
    it("throws 403 when non-admin updates another user profile", async () => {
      vi.mocked(userStore.findUserById).mockResolvedValue(mockUser);

      await expect(
        updateUser("requester-id", "other-user-id", { name: "New Name" }, false)
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("allows non-admin to update their own profile", async () => {
      vi.mocked(userStore.findUserById).mockResolvedValue(mockUser);
      vi.mocked(userStore.updateUser).mockResolvedValue({ ...mockUser, name: "Updated" });

      const result = await updateUser("user-1", "user-1", { name: "Updated" }, false);

      expect(result.name).toBe("Updated");
    });
  });

  describe("createUser", () => {
    it("throws 409 on duplicate email", async () => {
      vi.mocked(userStore.findUserByEmail).mockResolvedValue(mockUser);

      await expect(
        createUser({ name: "Test", email: "test@example.com", profileId: "profile-1" })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("creates user when email is unique", async () => {
      vi.mocked(userStore.findUserByEmail).mockResolvedValue(undefined);
      vi.mocked(userStore.createUser).mockResolvedValue(mockUser);

      const result = await createUser({
        name: "Test",
        email: "new@example.com",
        profileId: "profile-1",
      });

      expect(result).toEqual(mockUser);
      expect(userStore.createUser).toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("calls softDeleteUser", async () => {
      vi.mocked(userStore.findUserById).mockResolvedValue(mockUser);
      vi.mocked(userStore.softDeleteUser).mockResolvedValue(undefined);

      await deleteUser("user-1");

      expect(userStore.softDeleteUser).toHaveBeenCalledWith("user-1");
    });
  });
});
`);

write('tests/unit/profile.service.spec.ts', `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/profile/profile.store");

import * as profileStore from "../../src/modules/profile/profile.store";
import {
  createProfile,
  deleteProfile,
  getProfileById,
  listProfiles,
} from "../../src/modules/profile/profile.service";

// We also need to mock prisma for the name uniqueness check in createProfile
vi.mock("../../src/prisma", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "../../src/prisma";

const mockProfile = {
  id: "profile-1",
  name: "TestProfile",
  status: "A",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("profile.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listProfiles", () => {
    it("returns profiles array", async () => {
      vi.mocked(profileStore.listProfiles).mockResolvedValue([mockProfile]);

      const result = await listProfiles();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("TestProfile");
    });
  });

  describe("getProfileById", () => {
    it("throws 404 for unknown profile", async () => {
      vi.mocked(profileStore.findProfileById).mockResolvedValue(undefined);

      await expect(getProfileById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("returns profile when found", async () => {
      vi.mocked(profileStore.findProfileById).mockResolvedValue(mockProfile);

      const result = await getProfileById("profile-1");

      expect(result).toEqual(mockProfile);
    });
  });

  describe("createProfile", () => {
    it("throws 409 on duplicate name", async () => {
      vi.mocked(prisma.profile.findUnique as any).mockResolvedValue({ id: "existing", name: "TestProfile" });

      await expect(createProfile("TestProfile")).rejects.toMatchObject({ statusCode: 409 });
    });

    it("creates profile when name is unique", async () => {
      vi.mocked(prisma.profile.findUnique as any).mockResolvedValue(null);
      vi.mocked(profileStore.createProfile).mockResolvedValue(mockProfile);

      const result = await createProfile("NewProfile");

      expect(result).toEqual(mockProfile);
    });
  });

  describe("deleteProfile", () => {
    it("soft-deletes profile", async () => {
      vi.mocked(profileStore.findProfileById).mockResolvedValue(mockProfile);
      vi.mocked(profileStore.softDeleteProfile).mockResolvedValue(undefined);

      await deleteProfile("profile-1");

      expect(profileStore.softDeleteProfile).toHaveBeenCalledWith("profile-1");
    });
  });
});
`);

// ─── integration tests ───────────────────────────────────────────────────────

write('tests/integration/user.route.spec.ts', `import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { errorHandler } from "../../src/common/error-handler";
import { registerSelfManaged } from "../../src/modules/auth/auth.controller";
import { ensureAuthenticated } from "../../src/modules/auth/auth.middleware";
import {
  deleteUserHandler,
  getUserByIdHandler,
  listUsers,
  updateUserById,
} from "../../src/modules/user/user.controller";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.post("/auth/self-managed/register", registerSelfManaged);
  app.get("/users", ensureAuthenticated, listUsers);
  app.get("/users/:id", ensureAuthenticated, getUserByIdHandler);
  app.put("/users/:id", ensureAuthenticated, updateUserById);
  app.delete("/users/:id", ensureAuthenticated, deleteUserHandler);
  app.use(errorHandler);
  return app;
}

describe("user routes", () => {
  beforeEach(async () => {
    await resetSelfManagedStore();
  });

  it("GET /users/:id returns own profile (200)", async () => {
    const app = createTestApp();

    const reg = await request(app).post("/auth/self-managed/register").send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });
    expect(reg.status).toBe(201);

    const token = reg.body.token as string;
    const userId = reg.body.user.id as string;

    const res = await request(app)
      .get(\`/users/\${userId}\`)
      .set("Authorization", \`Bearer \${token}\`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("alice@example.com");
  });

  it("PUT /users/:id updates own name (200)", async () => {
    const app = createTestApp();

    const reg = await request(app).post("/auth/self-managed/register").send({
      name: "Bob",
      email: "bob@example.com",
      password: "password123",
    });
    const token = reg.body.token as string;
    const userId = reg.body.user.id as string;

    const res = await request(app)
      .put(\`/users/\${userId}\`)
      .set("Authorization", \`Bearer \${token}\`)
      .send({ name: "Bobby" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Bobby");
  });

  it("GET /users (non-admin) returns 403", async () => {
    const app = createTestApp();

    const reg = await request(app).post("/auth/self-managed/register").send({
      name: "Charlie",
      email: "charlie@example.com",
      password: "password123",
    });
    const token = reg.body.token as string;

    const res = await request(app)
      .get("/users")
      .set("Authorization", \`Bearer \${token}\`);

    expect(res.status).toBe(403);
  });
});
`);

write('tests/integration/profile.route.spec.ts', `import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { errorHandler } from "../../src/common/error-handler";
import { registerSelfManaged } from "../../src/modules/auth/auth.controller";
import { ensureAuthenticated } from "../../src/modules/auth/auth.middleware";
import {
  getProfileByIdHandler,
  listProfilesHandler,
} from "../../src/modules/profile/profile.controller";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.post("/auth/self-managed/register", registerSelfManaged);
  app.get("/profiles", ensureAuthenticated, listProfilesHandler);
  app.get("/profiles/:id", ensureAuthenticated, getProfileByIdHandler);
  app.use(errorHandler);
  return app;
}

describe("profile routes", () => {
  beforeEach(async () => {
    await resetSelfManagedStore();
  });

  it("GET /profiles returns 200 with array (even non-admin)", async () => {
    const app = createTestApp();

    const reg = await request(app).post("/auth/self-managed/register").send({
      name: "Dave",
      email: "dave@example.com",
      password: "password123",
    });
    const token = reg.body.token as string;

    const res = await request(app)
      .get("/profiles")
      .set("Authorization", \`Bearer \${token}\`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
`);

// ─── exercise module ──────────────────────────────────────────────────────────

write('src/modules/exercise/exercise.types.ts', `export interface ExerciseCategoryRecord {
  id: string;
  name: string;
  status: string;
}

export interface MuscleGroupRecord {
  id: string;
  name: string;
  muscles: Array<{ id: string; name: string }>;
}

export interface ExerciseRecord {
  id: string;
  categoryId: string;
  category: { id: string; name: string } | null;
  name: string;
  instruction: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  createdByUserId: string | null;
  isPublished: boolean;
  status: string;
  primaryMuscles: Array<{ muscleId: string; muscleName: string }>;
  secondaryMuscles: Array<{ muscleId: string; muscleName: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ListExercisesParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
}

export interface CreateExerciseInput {
  name: string;
  categoryId: string;
  instruction?: string;
  imageUrl?: string;
  videoUrl?: string;
  primaryMuscleIds?: string[];
  secondaryMuscleIds?: string[];
}

export interface UpdateExerciseInput {
  name?: string;
  categoryId?: string;
  instruction?: string;
  imageUrl?: string;
  videoUrl?: string;
  primaryMuscleIds?: string[];
  secondaryMuscleIds?: string[];
}
`);

write('src/modules/exercise/exercise.schemas.ts', `import { z } from "zod";

export const listExercisesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.uuid().optional(),
});

const muscleIdsSchema = z.array(z.uuid()).optional();

export const createExerciseSchema = z.object({
  name: z.string().min(2).max(120),
  categoryId: z.uuid(),
  instruction: z.string().max(1000).optional(),
  imageUrl: z.url().optional(),
  videoUrl: z.url().optional(),
  primaryMuscleIds: muscleIdsSchema,
  secondaryMuscleIds: muscleIdsSchema,
});

export const updateExerciseSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  categoryId: z.uuid().optional(),
  instruction: z.string().max(1000).optional(),
  imageUrl: z.url().optional(),
  videoUrl: z.url().optional(),
  primaryMuscleIds: muscleIdsSchema,
  secondaryMuscleIds: muscleIdsSchema,
});
`);

write('src/modules/exercise/exercise.store.ts', `import { prisma } from "../../prisma";
import {
  CreateExerciseInput,
  ExerciseCategoryRecord,
  ExerciseRecord,
  ListExercisesParams,
  MuscleGroupRecord,
  UpdateExerciseInput,
} from "./exercise.types";

function toExerciseRecord(row: {
  id: string;
  categoryId: string;
  category?: { id: string; name: string; status: string; createdAt: Date; updatedAt: Date | null } | null;
  name: string;
  instruction: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  createdByUserId: string | null;
  isPublished: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  primaryMuscles?: Array<{ muscleId: string; muscle?: { name: string } | null }>;
  secondaryMuscles?: Array<{ muscleId: string; muscle?: { name: string } | null }>;
}): ExerciseRecord {
  return {
    id: row.id,
    categoryId: row.categoryId,
    category: row.category ? { id: row.category.id, name: row.category.name } : null,
    name: row.name,
    instruction: row.instruction,
    imageUrl: row.imageUrl,
    videoUrl: row.videoUrl,
    createdByUserId: row.createdByUserId,
    isPublished: row.isPublished,
    status: row.status,
    primaryMuscles: (row.primaryMuscles ?? []).map((pm) => ({ muscleId: pm.muscleId, muscleName: pm.muscle?.name ?? "" })),
    secondaryMuscles: (row.secondaryMuscles ?? []).map((sm) => ({ muscleId: sm.muscleId, muscleName: sm.muscle?.name ?? "" })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
  };
}

const includeRelations = {
  category: true,
  primaryMuscles: { include: { muscle: true } },
  secondaryMuscles: { include: { muscle: true } },
} as const;

export async function listExercises(params: ListExercisesParams): Promise<{ data: ExerciseRecord[]; total: number }> {
  const { page, limit, search, categoryId } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "A", isPublished: true };
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.exercise.findMany({ where, skip, take: limit, include: includeRelations, orderBy: { name: "asc" } }),
    prisma.exercise.count({ where }),
  ]);

  return { data: rows.map(toExerciseRecord), total };
}

export async function listMyExercises(userId: string): Promise<ExerciseRecord[]> {
  const rows = await prisma.exercise.findMany({
    where: { createdByUserId: userId, status: "A" },
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toExerciseRecord);
}

export async function findExerciseById(id: string): Promise<ExerciseRecord | undefined> {
  const row = await prisma.exercise.findUnique({ where: { id }, include: includeRelations });
  return row ? toExerciseRecord(row) : undefined;
}

export async function createExercise(userId: string, input: CreateExerciseInput): Promise<ExerciseRecord> {
  const row = await prisma.exercise.create({
    data: {
      name: input.name.trim(),
      categoryId: input.categoryId,
      instruction: input.instruction?.trim() ?? null,
      imageUrl: input.imageUrl ?? null,
      videoUrl: input.videoUrl ?? null,
      createdByUserId: userId,
      isPublished: false,
      status: "A",
      primaryMuscles: input.primaryMuscleIds?.length
        ? { create: input.primaryMuscleIds.map((muscleId) => ({ muscleId, status: "A" })) }
        : undefined,
      secondaryMuscles: input.secondaryMuscleIds?.length
        ? { create: input.secondaryMuscleIds.map((muscleId) => ({ muscleId, status: "A" })) }
        : undefined,
    },
    include: includeRelations,
  });
  return toExerciseRecord(row);
}

export async function updateExercise(id: string, input: UpdateExerciseInput): Promise<ExerciseRecord> {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
  if (input.instruction !== undefined) updateData.instruction = input.instruction.trim();
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
  if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;

  if (input.primaryMuscleIds !== undefined) {
    await prisma.exercisePrimaryMuscle.deleteMany({ where: { exerciseId: id } });
    if (input.primaryMuscleIds.length > 0) {
      await prisma.exercisePrimaryMuscle.createMany({
        data: input.primaryMuscleIds.map((muscleId) => ({ muscleId, exerciseId: id, status: "A" })),
      });
    }
  }
  if (input.secondaryMuscleIds !== undefined) {
    await prisma.exerciseSecondaryMuscle.deleteMany({ where: { exerciseId: id } });
    if (input.secondaryMuscleIds.length > 0) {
      await prisma.exerciseSecondaryMuscle.createMany({
        data: input.secondaryMuscleIds.map((muscleId) => ({ muscleId, exerciseId: id, status: "A" })),
      });
    }
  }

  const row = await prisma.exercise.update({ where: { id }, data: updateData, include: includeRelations });
  return toExerciseRecord(row);
}

export async function softDeleteExercise(id: string): Promise<void> {
  await prisma.exercise.update({ where: { id }, data: { status: "I" } });
}

export async function listCategories(): Promise<ExerciseCategoryRecord[]> {
  return prisma.exerciseCategory.findMany({ where: { status: "A" }, orderBy: { name: "asc" } });
}

export async function listMuscleGroups(): Promise<MuscleGroupRecord[]> {
  const groups = await prisma.muscleGroup.findMany({
    where: { status: "A" },
    include: { muscles: { where: { status: "A" }, orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
  return groups.map((g) => ({ id: g.id, name: g.name, muscles: g.muscles.map((m) => ({ id: m.id, name: m.name })) }));
}
`);

write('src/modules/exercise/exercise.service.ts', `import { AppError } from "../../common/app-error";
import {
  createExercise as createExerciseInStore,
  findExerciseById,
  listCategories,
  listExercises as listExercisesInStore,
  listMuscleGroups,
  listMyExercises,
  softDeleteExercise,
  updateExercise as updateExerciseInStore,
} from "./exercise.store";
import { CreateExerciseInput, ListExercisesParams, UpdateExerciseInput } from "./exercise.types";

export async function getExercises(params: ListExercisesParams) {
  return listExercisesInStore(params);
}

export async function getMyExercises(userId: string) {
  return listMyExercises(userId);
}

export async function getExerciseById(id: string) {
  const exercise = await findExerciseById(id);
  if (!exercise) throw new AppError("Exercise not found", 404);
  return exercise;
}

export async function createExercise(userId: string, input: CreateExerciseInput) {
  return createExerciseInStore(userId, input);
}

export async function updateExercise(userId: string, exerciseId: string, input: UpdateExerciseInput, isAdmin: boolean) {
  const exercise = await getExerciseById(exerciseId);
  if (!isAdmin && exercise.createdByUserId !== userId) {
    throw new AppError("Forbidden", 403);
  }
  return updateExerciseInStore(exerciseId, input);
}

export async function deleteExercise(userId: string, exerciseId: string, isAdmin: boolean) {
  const exercise = await getExerciseById(exerciseId);
  if (!isAdmin && exercise.createdByUserId !== userId) {
    throw new AppError("Forbidden", 403);
  }
  await softDeleteExercise(exerciseId);
}

export async function getExerciseCategories() {
  return listCategories();
}

export async function getExerciseMuscleGroups() {
  return listMuscleGroups();
}
`);

write('src/modules/exercise/exercise.controller.ts', `import { Request, Response } from "express";

import { createExerciseSchema, listExercisesQuerySchema, updateExerciseSchema } from "./exercise.schemas";
import {
  createExercise,
  deleteExercise,
  getExerciseById,
  getExerciseCategories,
  getExerciseMuscleGroups,
  getExercises,
  getMyExercises,
  updateExercise,
} from "./exercise.service";

function getIdParam(req: Request, param = "exerciseId"): string {
  const v = req.params[param];
  return Array.isArray(v) ? v[0] : v;
}

export async function listExercisesHandler(request: Request, response: Response) {
  const query = listExercisesQuerySchema.parse(request.query);
  const result = await getExercises(query);
  return response.status(200).json({ data: result.data, total: result.total, page: query.page, limit: query.limit });
}

export async function listMyExercisesHandler(request: Request, response: Response) {
  const exercises = await getMyExercises(request.user!.id);
  return response.status(200).json(exercises);
}

export async function getExerciseByIdHandler(request: Request, response: Response) {
  const exercise = await getExerciseById(getIdParam(request));
  return response.status(200).json(exercise);
}

export async function createExerciseHandler(request: Request, response: Response) {
  const payload = createExerciseSchema.parse(request.body);
  const exercise = await createExercise(request.user!.id, payload);
  return response.status(201).json(exercise);
}

export async function updateExerciseHandler(request: Request, response: Response) {
  const payload = updateExerciseSchema.parse(request.body);
  const exercise = await updateExercise(request.user!.id, getIdParam(request), payload, request.user!.isAdmin);
  return response.status(200).json(exercise);
}

export async function deleteExerciseHandler(request: Request, response: Response) {
  await deleteExercise(request.user!.id, getIdParam(request), request.user!.isAdmin);
  return response.status(204).send();
}

export async function listCategoriesHandler(_request: Request, response: Response) {
  const categories = await getExerciseCategories();
  return response.status(200).json(categories);
}

export async function listMuscleGroupsHandler(_request: Request, response: Response) {
  const groups = await getExerciseMuscleGroups();
  return response.status(200).json(groups);
}
`);

// ─── bond module ──────────────────────────────────────────────────────────────

write('src/modules/bond/bond.types.ts', `export interface BondRecord {
  id: string;
  customerId: string;
  professionalId: string;
  senderId: string;
  status: string;
  customer?: { id: string; name: string; email: string } | null;
  professional?: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBondInput {
  customerId: string;
  professionalId: string;
}

export interface UpdateBondInput {
  status: string;
}

export interface ListActiveStudentsParams {
  page: number;
  limit: number;
  search?: string;
}
`);

write('src/modules/bond/bond.schemas.ts', `import { z } from "zod";

export const createBondSchema = z.object({
  customerId: z.uuid(),
  professionalId: z.uuid(),
});

export const updateBondSchema = z.object({
  status: z.enum(["A", "P", "R", "I"]),
});

export const listActiveStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});
`);

write('src/modules/bond/bond.store.ts', `import { prisma } from "../../prisma";
import { BondRecord, CreateBondInput, ListActiveStudentsParams } from "./bond.types";
import { AppError } from "../../common/app-error";

const includeUsers = {
  customer: { select: { id: true, name: true, email: true } },
  professional: { select: { id: true, name: true, email: true } },
} as const;

function toBondRecord(row: {
  id: string;
  customerId: string;
  professionalId: string;
  senderId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  customer?: { id: string; name: string; email: string } | null;
  professional?: { id: string; name: string; email: string } | null;
}): BondRecord {
  return {
    id: row.id,
    customerId: row.customerId,
    professionalId: row.professionalId,
    senderId: row.senderId,
    status: row.status,
    customer: row.customer ?? null,
    professional: row.professional ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
  };
}

export async function listAllBonds(): Promise<BondRecord[]> {
  const rows = await prisma.customerProfessionalBond.findMany({ include: includeUsers, orderBy: { createdAt: "desc" } });
  return rows.map(toBondRecord);
}

export async function listMyBonds(userId: string): Promise<BondRecord[]> {
  const rows = await prisma.customerProfessionalBond.findMany({
    where: { OR: [{ customerId: userId }, { professionalId: userId }] },
    include: includeUsers,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toBondRecord);
}

export async function listBondsSent(userId: string): Promise<BondRecord[]> {
  const rows = await prisma.customerProfessionalBond.findMany({ where: { senderId: userId }, include: includeUsers });
  return rows.map(toBondRecord);
}

export async function listBondsReceived(userId: string): Promise<BondRecord[]> {
  const rows = await prisma.customerProfessionalBond.findMany({
    where: {
      AND: [
        { OR: [{ customerId: userId }, { professionalId: userId }] },
        { senderId: { not: userId } },
      ],
    },
    include: includeUsers,
  });
  return rows.map(toBondRecord);
}

export async function listBondsAsCustomer(userId: string): Promise<BondRecord[]> {
  const rows = await prisma.customerProfessionalBond.findMany({ where: { customerId: userId }, include: includeUsers });
  return rows.map(toBondRecord);
}

export async function listBondsAsProfessional(userId: string): Promise<BondRecord[]> {
  const rows = await prisma.customerProfessionalBond.findMany({ where: { professionalId: userId }, include: includeUsers });
  return rows.map(toBondRecord);
}

export async function listActiveStudents(professionalId: string, params: ListActiveStudentsParams): Promise<{ data: BondRecord[]; total: number }> {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = { professionalId, status: "A" };
  if (search) where.customer = { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] };
  const [rows, total] = await Promise.all([
    prisma.customerProfessionalBond.findMany({ where, skip, take: limit, include: includeUsers }),
    prisma.customerProfessionalBond.count({ where }),
  ]);
  return { data: rows.map(toBondRecord), total };
}

export async function findBondById(id: string): Promise<BondRecord | undefined> {
  const row = await prisma.customerProfessionalBond.findUnique({ where: { id }, include: includeUsers });
  return row ? toBondRecord(row) : undefined;
}

export async function createBond(senderId: string, input: CreateBondInput): Promise<BondRecord> {
  const existing = await prisma.customerProfessionalBond.findFirst({
    where: { customerId: input.customerId, professionalId: input.professionalId },
  });
  if (existing) throw new AppError("Bond already exists", 409);

  const row = await prisma.customerProfessionalBond.create({
    data: { customerId: input.customerId, professionalId: input.professionalId, senderId, status: "P" },
    include: includeUsers,
  });
  return toBondRecord(row);
}

export async function updateBondStatus(id: string, status: string): Promise<BondRecord> {
  const row = await prisma.customerProfessionalBond.update({ where: { id }, data: { status }, include: includeUsers });
  return toBondRecord(row);
}

export async function deleteBond(id: string): Promise<void> {
  await prisma.customerProfessionalBond.delete({ where: { id } });
}
`);

write('src/modules/bond/bond.service.ts', `import { AppError } from "../../common/app-error";
import {
  createBond as createBondInStore,
  deleteBond as deleteBondInStore,
  findBondById,
  listActiveStudents as listActiveStudentsInStore,
  listAllBonds,
  listBondsAsCustomer,
  listBondsAsProfessional,
  listBondsSent,
  listBondsReceived,
  listMyBonds as listMyBondsInStore,
  updateBondStatus,
} from "./bond.store";
import { CreateBondInput, ListActiveStudentsParams, UpdateBondInput } from "./bond.types";

export async function getAllBonds() { return listAllBonds(); }
export async function getMyBonds(userId: string) { return listMyBondsInStore(userId); }
export async function getSentBonds(userId: string) { return listBondsSent(userId); }
export async function getReceivedBonds(userId: string) { return listBondsReceived(userId); }
export async function getBondsAsCustomer(userId: string) { return listBondsAsCustomer(userId); }
export async function getBondsAsProfessional(userId: string) { return listBondsAsProfessional(userId); }
export async function getActiveStudents(professionalId: string, params: ListActiveStudentsParams) {
  return listActiveStudentsInStore(professionalId, params);
}

export async function getBondById(id: string) {
  const bond = await findBondById(id);
  if (!bond) throw new AppError("Bond not found", 404);
  return bond;
}

export async function createBond(senderId: string, input: CreateBondInput) {
  return createBondInStore(senderId, input);
}

export async function updateBond(userId: string, bondId: string, input: UpdateBondInput, isAdmin: boolean) {
  const bond = await getBondById(bondId);
  if (!isAdmin && bond.customerId !== userId && bond.professionalId !== userId) {
    throw new AppError("Forbidden", 403);
  }
  return updateBondStatus(bondId, input.status);
}

export async function deleteBond(userId: string, bondId: string, isAdmin: boolean) {
  const bond = await getBondById(bondId);
  if (!isAdmin && bond.customerId !== userId && bond.professionalId !== userId) {
    throw new AppError("Forbidden", 403);
  }
  await deleteBondInStore(bondId);
}
`);

write('src/modules/bond/bond.controller.ts', `import { Request, Response } from "express";

import { AppError } from "../../common/app-error";
import { createBondSchema, listActiveStudentsQuerySchema, updateBondSchema } from "./bond.schemas";
import {
  createBond,
  deleteBond,
  getActiveStudents,
  getAllBonds,
  getBondById,
  getBondsAsCustomer,
  getBondsAsProfessional,
  getMyBonds,
  getReceivedBonds,
  getSentBonds,
  updateBond,
} from "./bond.service";

function getId(req: Request) { const v = req.params.id; return Array.isArray(v) ? v[0] : v; }

export async function listAllBondsHandler(request: Request, response: Response) {
  if (!request.user?.isAdmin) throw new AppError("Forbidden", 403);
  return response.status(200).json(await getAllBonds());
}
export async function getMyBondsHandler(request: Request, response: Response) {
  return response.status(200).json(await getMyBonds(request.user!.id));
}
export async function getSentBondsHandler(request: Request, response: Response) {
  return response.status(200).json(await getSentBonds(request.user!.id));
}
export async function getReceivedBondsHandler(request: Request, response: Response) {
  return response.status(200).json(await getReceivedBonds(request.user!.id));
}
export async function getBondsAsCustomerHandler(request: Request, response: Response) {
  return response.status(200).json(await getBondsAsCustomer(request.user!.id));
}
export async function getBondsAsProfessionalHandler(request: Request, response: Response) {
  return response.status(200).json(await getBondsAsProfessional(request.user!.id));
}
export async function getActiveStudentsHandler(request: Request, response: Response) {
  const query = listActiveStudentsQuerySchema.parse(request.query);
  const result = await getActiveStudents(request.user!.id, query);
  return response.status(200).json({ data: result.data, total: result.total, page: query.page, limit: query.limit });
}
export async function getBondByIdHandler(request: Request, response: Response) {
  return response.status(200).json(await getBondById(getId(request)));
}
export async function createBondHandler(request: Request, response: Response) {
  const payload = createBondSchema.parse(request.body);
  return response.status(201).json(await createBond(request.user!.id, payload));
}
export async function updateBondHandler(request: Request, response: Response) {
  const payload = updateBondSchema.parse(request.body);
  return response.status(200).json(await updateBond(request.user!.id, getId(request), payload, request.user!.isAdmin));
}
export async function deleteBondHandler(request: Request, response: Response) {
  await deleteBond(request.user!.id, getId(request), request.user!.isAdmin);
  return response.status(204).send();
}
`);

// ─── feedback module ──────────────────────────────────────────────────────────

write('src/modules/feedback/feedback.types.ts', `export interface FeedbackRecord {
  id: string;
  professionalId: string;
  customerId: string;
  testimony: string | null;
  rate: number;
  type: number;
  status: string;
  professional?: { id: string; name: string } | null;
  customer?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackInput {
  professionalId: string;
  testimony?: string;
  rate: number;
  type?: number;
}
`);

write('src/modules/feedback/feedback.schemas.ts', `import { z } from "zod";

export const createFeedbackSchema = z.object({
  professionalId: z.uuid(),
  testimony: z.string().max(1000).optional(),
  rate: z.number().int().min(1).max(5),
  type: z.number().int().min(0).default(0),
});
`);

write('src/modules/feedback/feedback.store.ts', `import { prisma } from "../../prisma";
import { CreateFeedbackInput, FeedbackRecord } from "./feedback.types";

const includeUsers = {
  professional: { select: { id: true, name: true } },
  customer: { select: { id: true, name: true } },
} as const;

function toFeedbackRecord(row: {
  id: string; professionalId: string; customerId: string; testimony: string | null; rate: number; type: number; status: string; createdAt: Date; updatedAt: Date | null;
  professional?: { id: string; name: string } | null;
  customer?: { id: string; name: string } | null;
}): FeedbackRecord {
  return {
    id: row.id, professionalId: row.professionalId, customerId: row.customerId,
    testimony: row.testimony, rate: row.rate, type: row.type, status: row.status,
    professional: row.professional ?? null, customer: row.customer ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
  };
}

export async function createFeedback(customerId: string, input: CreateFeedbackInput): Promise<FeedbackRecord> {
  const row = await prisma.customerFeedback.create({
    data: { customerId, professionalId: input.professionalId, testimony: input.testimony ?? null, rate: input.rate, type: input.type ?? 0, status: "A" },
    include: includeUsers,
  });
  return toFeedbackRecord(row);
}

export async function listFeedbacksByProfessional(professionalId: string): Promise<FeedbackRecord[]> {
  const rows = await prisma.customerFeedback.findMany({
    where: { professionalId, status: "A" }, include: includeUsers, orderBy: { createdAt: "desc" },
  });
  return rows.map(toFeedbackRecord);
}

export async function findFeedbackByBond(customerId: string, professionalId: string): Promise<FeedbackRecord | undefined> {
  const row = await prisma.customerFeedback.findFirst({ where: { customerId, professionalId, status: "A" }, include: includeUsers });
  return row ? toFeedbackRecord(row) : undefined;
}
`);

write('src/modules/feedback/feedback.service.ts', `import { CreateFeedbackInput } from "./feedback.types";
import { createFeedback as createFeedbackInStore, findFeedbackByBond, listFeedbacksByProfessional } from "./feedback.store";

export async function createFeedback(customerId: string, input: CreateFeedbackInput) {
  return createFeedbackInStore(customerId, input);
}

export async function getProfessionalFeedbacks(professionalId: string) {
  return listFeedbacksByProfessional(professionalId);
}

export async function getBondFeedback(customerId: string, professionalId: string) {
  return findFeedbackByBond(customerId, professionalId) ?? null;
}
`);

write('src/modules/feedback/feedback.controller.ts', `import { Request, Response } from "express";
import { createFeedbackSchema } from "./feedback.schemas";
import { createFeedback, getBondFeedback, getProfessionalFeedbacks } from "./feedback.service";

export async function createFeedbackHandler(request: Request, response: Response) {
  const payload = createFeedbackSchema.parse(request.body);
  return response.status(201).json(await createFeedback(request.user!.id, payload));
}

export async function listProfessionalFeedbacksHandler(request: Request, response: Response) {
  const id = request.params.professionalId;
  return response.status(200).json(await getProfessionalFeedbacks(id));
}

export async function getBondFeedbackHandler(request: Request, response: Response) {
  const { professionalId } = request.query as { professionalId?: string };
  if (!professionalId) return response.status(400).json({ message: "professionalId query param required" });
  const feedback = await getBondFeedback(request.user!.id, professionalId);
  return response.status(200).json(feedback);
}
`);

// ─── favorite module ──────────────────────────────────────────────────────────

write('src/modules/favorite/favorite.types.ts', `export interface FavoriteRecord {
  id: string;
  customerId: string;
  professionalId: string;
  professional?: { id: string; name: string; email: string } | null;
  createdAt: string;
}
`);

write('src/modules/favorite/favorite.store.ts', `import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";
import { FavoriteRecord } from "./favorite.types";

const includeProf = { professional: { select: { id: true, name: true, email: true } } } as const;

function toFavoriteRecord(row: { id: string; customerId: string; professionalId: string; createdAt: Date; professional?: { id: string; name: string; email: string } | null }): FavoriteRecord {
  return { id: row.id, customerId: row.customerId, professionalId: row.professionalId, professional: row.professional ?? null, createdAt: row.createdAt.toISOString() };
}

export async function addFavorite(customerId: string, professionalId: string): Promise<FavoriteRecord> {
  const existing = await prisma.favoriteProfessional.findUnique({ where: { customerId_professionalId: { customerId, professionalId } } });
  if (existing) throw new AppError("Already favorited", 409);
  const row = await prisma.favoriteProfessional.create({ data: { customerId, professionalId }, include: includeProf });
  return toFavoriteRecord(row);
}

export async function removeFavorite(customerId: string, professionalId: string): Promise<void> {
  await prisma.favoriteProfessional.delete({ where: { customerId_professionalId: { customerId, professionalId } } });
}

export async function listFavorites(customerId: string): Promise<FavoriteRecord[]> {
  const rows = await prisma.favoriteProfessional.findMany({ where: { customerId }, include: includeProf, orderBy: { createdAt: "desc" } });
  return rows.map(toFavoriteRecord);
}

export async function checkFavorite(customerId: string, professionalId: string): Promise<boolean> {
  const row = await prisma.favoriteProfessional.findUnique({ where: { customerId_professionalId: { customerId, professionalId } } });
  return row !== null;
}
`);

write('src/modules/favorite/favorite.service.ts', `import { addFavorite, checkFavorite, listFavorites, removeFavorite } from "./favorite.store";

export async function addFavoriteService(customerId: string, professionalId: string) {
  return addFavorite(customerId, professionalId);
}
export async function removeFavoriteService(customerId: string, professionalId: string) {
  await removeFavorite(customerId, professionalId);
}
export async function listFavoritesService(customerId: string) {
  return listFavorites(customerId);
}
export async function checkFavoriteService(customerId: string, professionalId: string) {
  return checkFavorite(customerId, professionalId);
}
`);

write('src/modules/favorite/favorite.controller.ts', `import { Request, Response } from "express";
import { addFavoriteService, checkFavoriteService, listFavoritesService, removeFavoriteService } from "./favorite.service";

function getProfId(req: Request) { const v = req.params.professionalId; return Array.isArray(v) ? v[0] : v; }

export async function addFavoriteHandler(request: Request, response: Response) {
  const fav = await addFavoriteService(request.user!.id, getProfId(request));
  return response.status(201).json(fav);
}
export async function removeFavoriteHandler(request: Request, response: Response) {
  await removeFavoriteService(request.user!.id, getProfId(request));
  return response.status(204).send();
}
export async function listFavoritesHandler(request: Request, response: Response) {
  return response.status(200).json(await listFavoritesService(request.user!.id));
}
export async function checkFavoriteHandler(request: Request, response: Response) {
  const isFav = await checkFavoriteService(request.user!.id, getProfId(request));
  return response.status(200).json({ isFavorite: isFav });
}
`);

// ─── appointment module ───────────────────────────────────────────────────────

write('src/modules/appointment/appointment.types.ts', `export interface AppointmentRecord {
  id: string;
  customerProfessionalBondId: string;
  scheduledAt: string;
  type: string;
  addressId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  customerProfessionalBondId: string;
  scheduledAt: string;
  type?: string;
  addressId?: string;
}

export interface UpdateAppointmentInput {
  scheduledAt?: string;
  type?: string;
  status?: string;
  addressId?: string;
}
`);

write('src/modules/appointment/appointment.schemas.ts', `import { z } from "zod";

export const createAppointmentSchema = z.object({
  customerProfessionalBondId: z.uuid(),
  scheduledAt: z.string().datetime(),
  type: z.string().max(10).default("PR"),
  addressId: z.uuid().optional(),
});

export const updateAppointmentSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  type: z.string().max(10).optional(),
  status: z.enum(["P", "A", "C", "D"]).optional(),
  addressId: z.uuid().optional(),
});
`);

write('src/modules/appointment/appointment.store.ts', `import { prisma } from "../../prisma";
import { AppointmentRecord, CreateAppointmentInput, UpdateAppointmentInput } from "./appointment.types";

function toRecord(row: { id: string; customerProfessionalBondId: string; scheduledAt: Date; type: string; addressId: string | null; status: string; createdAt: Date; updatedAt: Date | null }): AppointmentRecord {
  return { id: row.id, customerProfessionalBondId: row.customerProfessionalBondId, scheduledAt: row.scheduledAt.toISOString(), type: row.type, addressId: row.addressId, status: row.status, createdAt: row.createdAt.toISOString(), updatedAt: (row.updatedAt ?? row.createdAt).toISOString() };
}

export async function listAppointmentsByBond(bondId: string): Promise<AppointmentRecord[]> {
  const rows = await prisma.appointment.findMany({ where: { customerProfessionalBondId: bondId }, orderBy: { scheduledAt: "desc" } });
  return rows.map(toRecord);
}

export async function listCustomerAppointments(customerId: string, pendingOnly: boolean): Promise<AppointmentRecord[]> {
  const rows = await prisma.appointment.findMany({
    where: { bond: { customerId }, ...(pendingOnly ? { status: "P" } : {}) },
    orderBy: { scheduledAt: "asc" },
  });
  return rows.map(toRecord);
}

export async function listProfessionalAppointments(professionalId: string): Promise<AppointmentRecord[]> {
  const rows = await prisma.appointment.findMany({ where: { bond: { professionalId } }, orderBy: { scheduledAt: "asc" } });
  return rows.map(toRecord);
}

export async function findAppointmentById(id: string): Promise<AppointmentRecord | undefined> {
  const row = await prisma.appointment.findUnique({ where: { id } });
  return row ? toRecord(row) : undefined;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<AppointmentRecord> {
  const row = await prisma.appointment.create({
    data: { customerProfessionalBondId: input.customerProfessionalBondId, scheduledAt: new Date(input.scheduledAt), type: input.type ?? "PR", addressId: input.addressId ?? null, status: "P" },
  });
  return toRecord(row);
}

export async function updateAppointment(id: string, input: UpdateAppointmentInput): Promise<AppointmentRecord> {
  const data: Record<string, unknown> = {};
  if (input.scheduledAt) data.scheduledAt = new Date(input.scheduledAt);
  if (input.type) data.type = input.type;
  if (input.status) data.status = input.status;
  if (input.addressId !== undefined) data.addressId = input.addressId;
  const row = await prisma.appointment.update({ where: { id }, data });
  return toRecord(row);
}

export async function deleteAppointment(id: string): Promise<void> {
  await prisma.appointment.delete({ where: { id } });
}
`);

write('src/modules/appointment/appointment.service.ts', `import { AppError } from "../../common/app-error";
import {
  createAppointment as createInStore,
  deleteAppointment as deleteInStore,
  findAppointmentById,
  listAppointmentsByBond,
  listCustomerAppointments,
  listProfessionalAppointments,
  updateAppointment as updateInStore,
} from "./appointment.store";
import { CreateAppointmentInput, UpdateAppointmentInput } from "./appointment.types";

export async function getAppointmentsByBond(bondId: string) { return listAppointmentsByBond(bondId); }
export async function getCustomerPendingAppointments(customerId: string) { return listCustomerAppointments(customerId, true); }
export async function getAllCustomerAppointments(customerId: string) { return listCustomerAppointments(customerId, false); }
export async function getAllProfessionalAppointments(professionalId: string) { return listProfessionalAppointments(professionalId); }

export async function getAppointmentById(id: string) {
  const appt = await findAppointmentById(id);
  if (!appt) throw new AppError("Appointment not found", 404);
  return appt;
}

export async function createAppointment(input: CreateAppointmentInput) { return createInStore(input); }

export async function updateAppointment(id: string, input: UpdateAppointmentInput) {
  await getAppointmentById(id);
  return updateInStore(id, input);
}

export async function deleteAppointment(id: string) {
  await getAppointmentById(id);
  await deleteInStore(id);
}
`);

write('src/modules/appointment/appointment.controller.ts', `import { Request, Response } from "express";
import { createAppointmentSchema, updateAppointmentSchema } from "./appointment.schemas";
import {
  createAppointment, deleteAppointment, getAllCustomerAppointments, getAllProfessionalAppointments,
  getAppointmentById, getAppointmentsByBond, getCustomerPendingAppointments, updateAppointment,
} from "./appointment.service";

function getId(req: Request) { const v = req.params.id; return Array.isArray(v) ? v[0] : v; }

export async function listByBondHandler(request: Request, response: Response) {
  return response.status(200).json(await getAppointmentsByBond(request.params.bondId));
}
export async function listCustomerPendingHandler(request: Request, response: Response) {
  return response.status(200).json(await getCustomerPendingAppointments(request.user!.id));
}
export async function listCustomerAllHandler(request: Request, response: Response) {
  return response.status(200).json(await getAllCustomerAppointments(request.user!.id));
}
export async function listProfessionalAllHandler(request: Request, response: Response) {
  return response.status(200).json(await getAllProfessionalAppointments(request.user!.id));
}
export async function getByIdHandler(request: Request, response: Response) {
  return response.status(200).json(await getAppointmentById(getId(request)));
}
export async function createHandler(request: Request, response: Response) {
  const payload = createAppointmentSchema.parse(request.body);
  return response.status(201).json(await createAppointment(payload));
}
export async function updateHandler(request: Request, response: Response) {
  const payload = updateAppointmentSchema.parse(request.body);
  return response.status(200).json(await updateAppointment(getId(request), payload));
}
export async function deleteHandler(request: Request, response: Response) {
  await deleteAppointment(getId(request));
  return response.status(204).send();
}
`);

// ─── routine module ───────────────────────────────────────────────────────────

write('src/modules/routine/routine.types.ts', `export interface RoutineRecord {
  id: string;
  personalId: string;
  title: string;
  goal: string | null;
  difficulty: string | null;
  weeks: number | null;
  status: string;
  personal?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRoutineRecord {
  id: string;
  routineId: string;
  customerId: string;
  status: string;
  expiresAt: string | null;
  routine?: RoutineRecord | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutineInput {
  title: string;
  goal?: string;
  difficulty?: string;
  weeks?: number;
}

export interface UpdateRoutineInput {
  title?: string;
  goal?: string;
  difficulty?: string;
  weeks?: number;
}

export interface AssignRoutineInput {
  routineId: string;
  customerId: string;
  expiresAt?: string;
}
`);

write('src/modules/routine/routine.schemas.ts', `import { z } from "zod";

export const createRoutineSchema = z.object({
  title: z.string().min(2).max(120),
  goal: z.string().max(500).optional(),
  difficulty: z.string().max(50).optional(),
  weeks: z.number().int().min(1).max(52).optional(),
});

export const updateRoutineSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  goal: z.string().max(500).optional(),
  difficulty: z.string().max(50).optional(),
  weeks: z.number().int().min(1).max(52).optional(),
});

export const assignRoutineSchema = z.object({
  routineId: z.uuid(),
  customerId: z.uuid(),
  expiresAt: z.string().datetime().optional(),
});

export const updateExpirySchema = z.object({
  expiresAt: z.string().datetime(),
});

export const listRoutinesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});
`);

write('src/modules/routine/routine.store.ts', `import { prisma } from "../../prisma";
import { AssignRoutineInput, CreateRoutineInput, CustomerRoutineRecord, RoutineRecord, UpdateRoutineInput } from "./routine.types";
import { AppError } from "../../common/app-error";

const includePersonal = { personal: { select: { id: true, name: true } } } as const;

function toRoutineRecord(row: { id: string; personalId: string; title: string; goal: string | null; difficulty: string | null; weeks: number | null; status: string; createdAt: Date; updatedAt: Date | null; personal?: { id: string; name: string } | null }): RoutineRecord {
  return { id: row.id, personalId: row.personalId, title: row.title, goal: row.goal, difficulty: row.difficulty, weeks: row.weeks, status: row.status, personal: row.personal ?? null, createdAt: row.createdAt.toISOString(), updatedAt: (row.updatedAt ?? row.createdAt).toISOString() };
}

export async function listRoutinesByPersonal(personalId: string, params: { page: number; limit: number; search?: string }): Promise<{ data: RoutineRecord[]; total: number }> {
  const skip = (params.page - 1) * params.limit;
  const where: Record<string, unknown> = { personalId, status: "A" };
  if (params.search) where.title = { contains: params.search, mode: "insensitive" };
  const [rows, total] = await Promise.all([
    prisma.routine.findMany({ where, skip, take: params.limit, include: includePersonal, orderBy: { createdAt: "desc" } }),
    prisma.routine.count({ where }),
  ]);
  return { data: rows.map(toRoutineRecord), total };
}

export async function listAssignedRoutines(customerId: string): Promise<CustomerRoutineRecord[]> {
  const rows = await prisma.customerRoutine.findMany({
    where: { customerId, status: "A" },
    include: { routine: { include: includePersonal } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((cr) => ({
    id: cr.id, routineId: cr.routineId, customerId: cr.customerId, status: cr.status,
    expiresAt: cr.expiresAt?.toISOString() ?? null,
    routine: cr.routine ? toRoutineRecord(cr.routine) : null,
    createdAt: cr.createdAt.toISOString(), updatedAt: (cr.updatedAt ?? cr.createdAt).toISOString(),
  }));
}

export async function listNearExpiryRoutines(personalId: string): Promise<CustomerRoutineRecord[]> {
  const cutoff = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.customerRoutine.findMany({
    where: { routine: { personalId }, status: "A", expiresAt: { lte: cutoff, gte: new Date() } },
    include: { routine: { include: includePersonal } },
    orderBy: { expiresAt: "asc" },
  });
  return rows.map((cr) => ({
    id: cr.id, routineId: cr.routineId, customerId: cr.customerId, status: cr.status,
    expiresAt: cr.expiresAt?.toISOString() ?? null,
    routine: cr.routine ? toRoutineRecord(cr.routine) : null,
    createdAt: cr.createdAt.toISOString(), updatedAt: (cr.updatedAt ?? cr.createdAt).toISOString(),
  }));
}

export async function findRoutineById(id: string): Promise<RoutineRecord | undefined> {
  const row = await prisma.routine.findUnique({ where: { id }, include: includePersonal });
  return row ? toRoutineRecord(row) : undefined;
}

export async function listRoutineCustomers(routineId: string): Promise<CustomerRoutineRecord[]> {
  const rows = await prisma.customerRoutine.findMany({ where: { routineId, status: "A" }, orderBy: { createdAt: "desc" } });
  return rows.map((cr) => ({ id: cr.id, routineId: cr.routineId, customerId: cr.customerId, status: cr.status, expiresAt: cr.expiresAt?.toISOString() ?? null, routine: null, createdAt: cr.createdAt.toISOString(), updatedAt: (cr.updatedAt ?? cr.createdAt).toISOString() }));
}

export async function createRoutine(personalId: string, input: CreateRoutineInput): Promise<RoutineRecord> {
  const row = await prisma.routine.create({ data: { personalId, title: input.title.trim(), goal: input.goal ?? null, difficulty: input.difficulty ?? null, weeks: input.weeks ?? null, status: "A" }, include: includePersonal });
  return toRoutineRecord(row);
}

export async function updateRoutine(id: string, input: UpdateRoutineInput): Promise<RoutineRecord> {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.goal !== undefined) data.goal = input.goal;
  if (input.difficulty !== undefined) data.difficulty = input.difficulty;
  if (input.weeks !== undefined) data.weeks = input.weeks;
  const row = await prisma.routine.update({ where: { id }, data, include: includePersonal });
  return toRoutineRecord(row);
}

export async function softDeleteRoutine(id: string): Promise<void> {
  await prisma.routine.update({ where: { id }, data: { status: "I" } });
}

export async function assignRoutine(input: AssignRoutineInput): Promise<CustomerRoutineRecord> {
  const existing = await prisma.customerRoutine.findUnique({ where: { routineId_customerId: { routineId: input.routineId, customerId: input.customerId } } });
  if (existing) throw new AppError("Routine already assigned to this customer", 409);
  const row = await prisma.customerRoutine.create({ data: { routineId: input.routineId, customerId: input.customerId, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null, status: "A" } });
  return { id: row.id, routineId: row.routineId, customerId: row.customerId, status: row.status, expiresAt: row.expiresAt?.toISOString() ?? null, routine: null, createdAt: row.createdAt.toISOString(), updatedAt: (row.updatedAt ?? row.createdAt).toISOString() };
}

export async function unassignRoutine(routineId: string, customerId: string): Promise<void> {
  await prisma.customerRoutine.delete({ where: { routineId_customerId: { routineId, customerId } } });
}

export async function updateCustomerRoutineExpiry(routineId: string, customerId: string, expiresAt: string): Promise<CustomerRoutineRecord> {
  const row = await prisma.customerRoutine.update({ where: { routineId_customerId: { routineId, customerId } }, data: { expiresAt: new Date(expiresAt) } });
  return { id: row.id, routineId: row.routineId, customerId: row.customerId, status: row.status, expiresAt: row.expiresAt?.toISOString() ?? null, routine: null, createdAt: row.createdAt.toISOString(), updatedAt: (row.updatedAt ?? row.createdAt).toISOString() };
}
`);

write('src/modules/routine/routine.service.ts', `import { AppError } from "../../common/app-error";
import {
  assignRoutine as assignInStore,
  createRoutine as createInStore,
  findRoutineById,
  listAssignedRoutines,
  listNearExpiryRoutines,
  listRoutineCustomers,
  listRoutinesByPersonal,
  softDeleteRoutine,
  unassignRoutine as unassignInStore,
  updateCustomerRoutineExpiry as updateExpiryInStore,
  updateRoutine as updateInStore,
} from "./routine.store";
import { AssignRoutineInput, CreateRoutineInput, UpdateRoutineInput } from "./routine.types";

export async function getMyRoutines(personalId: string, params: { page: number; limit: number; search?: string }) {
  return listRoutinesByPersonal(personalId, params);
}
export async function getMyAssignedRoutines(customerId: string) { return listAssignedRoutines(customerId); }
export async function getNearExpiryRoutines(personalId: string) { return listNearExpiryRoutines(personalId); }

export async function getRoutineById(id: string) {
  const routine = await findRoutineById(id);
  if (!routine) throw new AppError("Routine not found", 404);
  return routine;
}

export async function getRoutineCustomers(routineId: string) { return listRoutineCustomers(routineId); }

export async function createRoutine(personalId: string, input: CreateRoutineInput) {
  return createInStore(personalId, input);
}

export async function updateRoutine(userId: string, routineId: string, input: UpdateRoutineInput, isAdmin: boolean) {
  const routine = await getRoutineById(routineId);
  if (!isAdmin && routine.personalId !== userId) throw new AppError("Forbidden", 403);
  return updateInStore(routineId, input);
}

export async function deleteRoutine(userId: string, routineId: string, isAdmin: boolean) {
  const routine = await getRoutineById(routineId);
  if (!isAdmin && routine.personalId !== userId) throw new AppError("Forbidden", 403);
  await softDeleteRoutine(routineId);
}

export async function assignRoutine(input: AssignRoutineInput) { return assignInStore(input); }

export async function unassignRoutine(routineId: string, customerId: string) {
  await unassignInStore(routineId, customerId);
}

export async function updateRoutineExpiry(routineId: string, customerId: string, expiresAt: string) {
  return updateExpiryInStore(routineId, customerId, expiresAt);
}
`);

write('src/modules/routine/routine.controller.ts', `import { Request, Response } from "express";
import { assignRoutineSchema, createRoutineSchema, listRoutinesQuerySchema, updateExpirySchema, updateRoutineSchema } from "./routine.schemas";
import {
  assignRoutine, createRoutine, deleteRoutine, getMyAssignedRoutines, getMyRoutines,
  getNearExpiryRoutines, getRoutineById, getRoutineCustomers, unassignRoutine, updateRoutine, updateRoutineExpiry,
} from "./routine.service";

function getId(req: Request, param = "routineId") { const v = req.params[param]; return Array.isArray(v) ? v[0] : v; }

export async function listMyRoutinesHandler(request: Request, response: Response) {
  const query = listRoutinesQuerySchema.parse(request.query);
  const result = await getMyRoutines(request.user!.id, query);
  return response.status(200).json({ data: result.data, total: result.total, page: query.page, limit: query.limit });
}
export async function listAssignedRoutinesHandler(request: Request, response: Response) {
  return response.status(200).json(await getMyAssignedRoutines(request.user!.id));
}
export async function listNearExpiryHandler(request: Request, response: Response) {
  return response.status(200).json(await getNearExpiryRoutines(request.user!.id));
}
export async function getRoutineByIdHandler(request: Request, response: Response) {
  return response.status(200).json(await getRoutineById(getId(request)));
}
export async function getRoutineCustomersHandler(request: Request, response: Response) {
  return response.status(200).json(await getRoutineCustomers(getId(request)));
}
export async function createRoutineHandler(request: Request, response: Response) {
  const payload = createRoutineSchema.parse(request.body);
  return response.status(201).json(await createRoutine(request.user!.id, payload));
}
export async function updateRoutineHandler(request: Request, response: Response) {
  const payload = updateRoutineSchema.parse(request.body);
  return response.status(200).json(await updateRoutine(request.user!.id, getId(request), payload, request.user!.isAdmin));
}
export async function deleteRoutineHandler(request: Request, response: Response) {
  await deleteRoutine(request.user!.id, getId(request), request.user!.isAdmin);
  return response.status(204).send();
}
export async function assignRoutineHandler(request: Request, response: Response) {
  const payload = assignRoutineSchema.parse(request.body);
  return response.status(201).json(await assignRoutine(payload));
}
export async function unassignRoutineHandler(request: Request, response: Response) {
  await unassignRoutine(getId(request), request.params.customerId);
  return response.status(204).send();
}
export async function updateExpiryHandler(request: Request, response: Response) {
  const { expiresAt } = updateExpirySchema.parse(request.body);
  return response.status(200).json(await updateRoutineExpiry(getId(request), request.params.customerId, expiresAt));
}
`);

// ─── workout-template module (relational, trainer flow) ───────────────────────

write('src/modules/workout-template/workout-template.types.ts', `export interface ExerciseTemplateRecord {
  id: string;
  workoutTemplateId: string;
  exerciseId: string;
  exercise?: { id: string; name: string } | null;
  order: number;
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  suggestedLoad: number | null;
  restSeconds: number | null;
  notes: string | null;
  status: string;
}

export interface WorkoutTemplateRecord {
  id: string;
  routineId: string | null;
  userId: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  estimatedDurationMinutes: number | null;
  order: number;
  status: string;
  exerciseTemplates: ExerciseTemplateRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutTemplateInput {
  title: string;
  description?: string;
  notes?: string;
  estimatedDurationMinutes?: number;
  order?: number;
}

export interface UpdateWorkoutTemplateInput {
  title?: string;
  description?: string;
  notes?: string;
  estimatedDurationMinutes?: number;
  order?: number;
}

export interface AddExerciseTemplateInput {
  exerciseId: string;
  order?: number;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
}

export interface UpdateExerciseTemplateInput {
  order?: number;
  targetSets?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
}
`);

write('src/modules/workout-template/workout-template.schemas.ts', `import { z } from "zod";

export const createWorkoutTemplateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  estimatedDurationMinutes: z.number().int().min(1).max(300).optional(),
  order: z.number().int().min(0).default(0),
});

export const updateWorkoutTemplateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  estimatedDurationMinutes: z.number().int().min(1).max(300).optional(),
  order: z.number().int().min(0).optional(),
});

export const addExerciseTemplateSchema = z.object({
  exerciseId: z.uuid(),
  order: z.number().int().min(0).default(0),
  targetSets: z.number().int().min(1).max(20).default(3),
  targetRepsMin: z.number().int().min(1).max(100).optional(),
  targetRepsMax: z.number().int().min(1).max(100).optional(),
  suggestedLoad: z.number().min(0).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(500).optional(),
});

export const updateExerciseTemplateSchema = z.object({
  order: z.number().int().min(0).optional(),
  targetSets: z.number().int().min(1).max(20).optional(),
  targetRepsMin: z.number().int().min(1).max(100).optional(),
  targetRepsMax: z.number().int().min(1).max(100).optional(),
  suggestedLoad: z.number().min(0).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(500).optional(),
});

export const reorderExercisesSchema = z.object({
  exerciseTemplateIds: z.array(z.uuid()),
});
`);

write('src/modules/workout-template/workout-template.store.ts', `import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";
import {
  AddExerciseTemplateInput,
  CreateWorkoutTemplateInput,
  ExerciseTemplateRecord,
  UpdateExerciseTemplateInput,
  UpdateWorkoutTemplateInput,
  WorkoutTemplateRecord,
} from "./workout-template.types";

const includeExercises = {
  exerciseTemplates: {
    where: { status: "A" },
    include: { exercise: { select: { id: true, name: true } } },
    orderBy: { order: "asc" as const },
  },
} as const;

function toExerciseTemplateRecord(et: { id: string; workoutTemplateId: string; exerciseId: string; exercise?: { id: string; name: string } | null; order: number; targetSets: number; targetRepsMin: number | null; targetRepsMax: number | null; suggestedLoad: Decimal | null; restSeconds: number | null; notes: string | null; status: string }): ExerciseTemplateRecord {
  return { id: et.id, workoutTemplateId: et.workoutTemplateId, exerciseId: et.exerciseId, exercise: et.exercise ?? null, order: et.order, targetSets: et.targetSets, targetRepsMin: et.targetRepsMin, targetRepsMax: et.targetRepsMax, suggestedLoad: et.suggestedLoad ? Number(et.suggestedLoad) : null, restSeconds: et.restSeconds, notes: et.notes, status: et.status };
}

function toWorkoutTemplateRecord(row: { id: string; routineId: string | null; userId: string | null; title: string; description: string | null; notes: string | null; estimatedDurationMinutes: number | null; order: number; status: string; createdAt: Date; updatedAt: Date | null; exerciseTemplates?: Array<{ id: string; workoutTemplateId: string; exerciseId: string; exercise?: { id: string; name: string } | null; order: number; targetSets: number; targetRepsMin: number | null; targetRepsMax: number | null; suggestedLoad: Decimal | null; restSeconds: number | null; notes: string | null; status: string }> }): WorkoutTemplateRecord {
  return { id: row.id, routineId: row.routineId, userId: row.userId, title: row.title, description: row.description, notes: row.notes, estimatedDurationMinutes: row.estimatedDurationMinutes, order: row.order, status: row.status, exerciseTemplates: (row.exerciseTemplates ?? []).map(toExerciseTemplateRecord), createdAt: row.createdAt.toISOString(), updatedAt: (row.updatedAt ?? row.createdAt).toISOString() };
}

export async function listTemplatesByRoutine(routineId: string): Promise<WorkoutTemplateRecord[]> {
  const rows = await prisma.workoutTemplate.findMany({ where: { routineId, status: "A" }, include: includeExercises, orderBy: { order: "asc" } });
  return rows.map(toWorkoutTemplateRecord);
}

export async function findTemplateById(id: string): Promise<WorkoutTemplateRecord | undefined> {
  const row = await prisma.workoutTemplate.findUnique({ where: { id }, include: includeExercises });
  return row ? toWorkoutTemplateRecord(row) : undefined;
}

export async function createWorkoutTemplate(routineId: string, input: CreateWorkoutTemplateInput): Promise<WorkoutTemplateRecord> {
  const row = await prisma.workoutTemplate.create({ data: { routineId, title: input.title.trim(), description: input.description ?? null, notes: input.notes ?? null, estimatedDurationMinutes: input.estimatedDurationMinutes ?? null, order: input.order ?? 0, status: "A" }, include: includeExercises });
  return toWorkoutTemplateRecord(row);
}

export async function updateWorkoutTemplate(id: string, input: UpdateWorkoutTemplateInput): Promise<WorkoutTemplateRecord> {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.description !== undefined) data.description = input.description;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.estimatedDurationMinutes !== undefined) data.estimatedDurationMinutes = input.estimatedDurationMinutes;
  if (input.order !== undefined) data.order = input.order;
  const row = await prisma.workoutTemplate.update({ where: { id }, data, include: includeExercises });
  return toWorkoutTemplateRecord(row);
}

export async function softDeleteWorkoutTemplate(id: string): Promise<void> {
  await prisma.workoutTemplate.update({ where: { id }, data: { status: "I" } });
}

export async function addExerciseToTemplate(workoutTemplateId: string, input: AddExerciseTemplateInput): Promise<ExerciseTemplateRecord> {
  const et = await prisma.exerciseTemplate.create({
    data: { workoutTemplateId, exerciseId: input.exerciseId, order: input.order ?? 0, targetSets: input.targetSets ?? 3, targetRepsMin: input.targetRepsMin ?? null, targetRepsMax: input.targetRepsMax ?? null, suggestedLoad: input.suggestedLoad ?? null, restSeconds: input.restSeconds ?? null, notes: input.notes ?? null, status: "A" },
    include: { exercise: { select: { id: true, name: true } } },
  });
  return toExerciseTemplateRecord(et);
}

export async function updateExerciseTemplate(id: string, input: UpdateExerciseTemplateInput): Promise<ExerciseTemplateRecord> {
  const data: Record<string, unknown> = {};
  if (input.order !== undefined) data.order = input.order;
  if (input.targetSets !== undefined) data.targetSets = input.targetSets;
  if (input.targetRepsMin !== undefined) data.targetRepsMin = input.targetRepsMin;
  if (input.targetRepsMax !== undefined) data.targetRepsMax = input.targetRepsMax;
  if (input.suggestedLoad !== undefined) data.suggestedLoad = input.suggestedLoad;
  if (input.restSeconds !== undefined) data.restSeconds = input.restSeconds;
  if (input.notes !== undefined) data.notes = input.notes;
  const et = await prisma.exerciseTemplate.update({ where: { id }, data, include: { exercise: { select: { id: true, name: true } } } });
  return toExerciseTemplateRecord(et);
}

export async function removeExerciseFromTemplate(exerciseTemplateId: string): Promise<void> {
  await prisma.exerciseTemplate.update({ where: { id: exerciseTemplateId }, data: { status: "I" } });
}

export async function reorderExercises(workoutTemplateId: string, exerciseTemplateIds: string[]): Promise<void> {
  for (let i = 0; i < exerciseTemplateIds.length; i++) {
    await prisma.exerciseTemplate.update({ where: { id: exerciseTemplateIds[i] }, data: { order: i } });
  }
}
`);

write('src/modules/workout-template/workout-template.service.ts', `import { AppError } from "../../common/app-error";
import {
  addExerciseToTemplate,
  createWorkoutTemplate as createInStore,
  findTemplateById,
  listTemplatesByRoutine,
  reorderExercises as reorderInStore,
  removeExerciseFromTemplate,
  softDeleteWorkoutTemplate,
  updateExerciseTemplate as updateExerciseInStore,
  updateWorkoutTemplate as updateInStore,
} from "./workout-template.store";
import { AddExerciseTemplateInput, CreateWorkoutTemplateInput, UpdateExerciseTemplateInput, UpdateWorkoutTemplateInput } from "./workout-template.types";

export async function getTemplatesByRoutine(routineId: string) { return listTemplatesByRoutine(routineId); }

export async function getTemplateById(id: string) {
  const template = await findTemplateById(id);
  if (!template) throw new AppError("Workout template not found", 404);
  return template;
}

export async function createTemplate(routineId: string, input: CreateWorkoutTemplateInput) {
  return createInStore(routineId, input);
}

export async function updateTemplate(id: string, input: UpdateWorkoutTemplateInput) {
  await getTemplateById(id);
  return updateInStore(id, input);
}

export async function deleteTemplate(id: string) {
  await getTemplateById(id);
  await softDeleteWorkoutTemplate(id);
}

export async function addExercise(templateId: string, input: AddExerciseTemplateInput) {
  await getTemplateById(templateId);
  return addExerciseToTemplate(templateId, input);
}

export async function updateExercise(exerciseTemplateId: string, input: UpdateExerciseTemplateInput) {
  return updateExerciseInStore(exerciseTemplateId, input);
}

export async function removeExercise(exerciseTemplateId: string) {
  await removeExerciseFromTemplate(exerciseTemplateId);
}

export async function reorderExercises(templateId: string, exerciseTemplateIds: string[]) {
  await reorderInStore(templateId, exerciseTemplateIds);
}
`);

write('src/modules/workout-template/workout-template.controller.ts', `import { Request, Response } from "express";
import {
  addExerciseTemplateSchema,
  createWorkoutTemplateSchema,
  reorderExercisesSchema,
  updateExerciseTemplateSchema,
  updateWorkoutTemplateSchema,
} from "./workout-template.schemas";
import {
  addExercise, createTemplate, deleteTemplate, getTemplateById, getTemplatesByRoutine,
  removeExercise, reorderExercises, updateExercise, updateTemplate,
} from "./workout-template.service";

function getId(req: Request, param = "templateId") { const v = req.params[param]; return Array.isArray(v) ? v[0] : v; }

export async function listByRoutineHandler(request: Request, response: Response) {
  return response.status(200).json(await getTemplatesByRoutine(request.params.routineId));
}
export async function getByIdHandler(request: Request, response: Response) {
  return response.status(200).json(await getTemplateById(getId(request)));
}
export async function createTemplateHandler(request: Request, response: Response) {
  const payload = createWorkoutTemplateSchema.parse(request.body);
  return response.status(201).json(await createTemplate(request.params.routineId, payload));
}
export async function updateTemplateHandler(request: Request, response: Response) {
  const payload = updateWorkoutTemplateSchema.parse(request.body);
  return response.status(200).json(await updateTemplate(getId(request), payload));
}
export async function deleteTemplateHandler(request: Request, response: Response) {
  await deleteTemplate(getId(request));
  return response.status(204).send();
}
export async function addExerciseHandler(request: Request, response: Response) {
  const payload = addExerciseTemplateSchema.parse(request.body);
  return response.status(201).json(await addExercise(getId(request), payload));
}
export async function updateExerciseHandler(request: Request, response: Response) {
  const payload = updateExerciseTemplateSchema.parse(request.body);
  return response.status(200).json(await updateExercise(getId(request, "exerciseTemplateId"), payload));
}
export async function removeExerciseHandler(request: Request, response: Response) {
  await removeExercise(getId(request, "exerciseTemplateId"));
  return response.status(204).send();
}
export async function reorderExercisesHandler(request: Request, response: Response) {
  const { exerciseTemplateIds } = reorderExercisesSchema.parse(request.body);
  await reorderExercises(getId(request), exerciseTemplateIds);
  return response.status(200).json({ message: "Reordered" });
}
`);

// ─── workout-session module (trainer-assigned) ────────────────────────────────

write('src/modules/workout-session/workout-session.types.ts', `import { Decimal } from "@prisma/client/runtime/library";

export interface SetSessionRecord {
  id: string;
  exerciseSessionId: string;
  setNumber: number;
  load: number | null;
  reps: number | null;
  restSeconds: number | null;
  completed: boolean;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface ExerciseSessionRecord {
  id: string;
  workoutSessionId: string;
  exerciseTemplateId: string | null;
  exerciseId: string | null;
  exercise?: { id: string; name: string } | null;
  order: number;
  status: string;
  notes: string | null;
  plannedSets: number | null;
  plannedReps: number | null;
  completedSets: number | null;
  completedReps: number | null;
  startedAt: string | null;
  completedAt: string | null;
  setSessions: SetSessionRecord[];
}

export interface WorkoutSessionRecord {
  id: string;
  workoutTemplateId: string | null;
  customerId: string | null;
  routineId: string | null;
  userId: string | null;
  titleSnapshot: string | null;
  startedAt: string;
  finishedAt: string | null;
  completedAt: string | null;
  durationMinutes: number | null;
  totalVolume: number | null;
  status: string;
  difficultyRating: number | null;
  energyRating: number | null;
  notes: string | null;
  exerciseSessions: ExerciseSessionRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CompleteWorkoutSessionInput {
  workoutTemplateId: string;
  routineId?: string;
  titleSnapshot?: string;
  durationMinutes?: number;
  difficultyRating?: number;
  energyRating?: number;
  notes?: string;
  exercises: Array<{
    exerciseTemplateId?: string;
    exerciseId?: string;
    order?: number;
    completedSets?: number;
    completedReps?: number;
    sets: Array<{
      setNumber: number;
      load?: number;
      reps?: number;
      restSeconds?: number;
      completed?: boolean;
      notes?: string;
    }>;
  }>;
}
`);

write('src/modules/workout-session/workout-session.schemas.ts', `import { z } from "zod";

const setSchema = z.object({
  setNumber: z.number().int().min(1),
  load: z.number().min(0).optional(),
  reps: z.number().int().min(0).optional(),
  restSeconds: z.number().int().min(0).optional(),
  completed: z.boolean().default(true),
  notes: z.string().max(200).optional(),
});

const exerciseSchema = z.object({
  exerciseTemplateId: z.uuid().optional(),
  exerciseId: z.uuid().optional(),
  order: z.number().int().min(0).default(0),
  completedSets: z.number().int().min(0).optional(),
  completedReps: z.number().int().min(0).optional(),
  sets: z.array(setSchema).min(1).max(20),
});

export const completeWorkoutSessionSchema = z.object({
  workoutTemplateId: z.uuid(),
  routineId: z.uuid().optional(),
  titleSnapshot: z.string().max(120).optional(),
  durationMinutes: z.number().int().min(1).optional(),
  difficultyRating: z.number().int().min(1).max(5).optional(),
  energyRating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
  exercises: z.array(exerciseSchema).min(1).max(50),
});

export const sessionHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
`);

write('src/modules/workout-session/workout-session.store.ts', `import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";
import { CompleteWorkoutSessionInput, ExerciseSessionRecord, SetSessionRecord, WorkoutSessionRecord } from "./workout-session.types";

function toSetRecord(s: { id: string; exerciseSessionId: string; setNumber: number; load: Decimal | null; reps: number | null; restSeconds: number | null; completed: boolean; notes: string | null; startedAt: Date; completedAt: Date | null }): SetSessionRecord {
  return { id: s.id, exerciseSessionId: s.exerciseSessionId, setNumber: s.setNumber, load: s.load ? Number(s.load) : null, reps: s.reps, restSeconds: s.restSeconds, completed: s.completed, notes: s.notes, startedAt: s.startedAt.toISOString(), completedAt: s.completedAt?.toISOString() ?? null };
}

function toExerciseSessionRecord(es: { id: string; workoutSessionId: string; exerciseTemplateId: string | null; exerciseId: string | null; exercise?: { id: string; name: string } | null; order: number; status: string; notes: string | null; plannedSets: number | null; plannedReps: number | null; completedSets: number | null; completedReps: number | null; startedAt: Date | null; completedAt: Date | null; setSessions: Array<{ id: string; exerciseSessionId: string; setNumber: number; load: Decimal | null; reps: number | null; restSeconds: number | null; completed: boolean; notes: string | null; startedAt: Date; completedAt: Date | null }> }): ExerciseSessionRecord {
  return { id: es.id, workoutSessionId: es.workoutSessionId, exerciseTemplateId: es.exerciseTemplateId, exerciseId: es.exerciseId, exercise: es.exercise ?? null, order: es.order, status: es.status, notes: es.notes, plannedSets: es.plannedSets, plannedReps: es.plannedReps, completedSets: es.completedSets, completedReps: es.completedReps, startedAt: es.startedAt?.toISOString() ?? null, completedAt: es.completedAt?.toISOString() ?? null, setSessions: es.setSessions.map(toSetRecord) };
}

const includeRelations = {
  exerciseSessions: { include: { exercise: { select: { id: true, name: true } }, setSessions: { orderBy: { setNumber: "asc" as const } } }, orderBy: { order: "asc" as const } },
} as const;

function toWorkoutSessionRecord(ws: { id: string; workoutTemplateId: string | null; customerId: string | null; routineId: string | null; userId: string | null; titleSnapshot: string | null; startedAt: Date; finishedAt: Date | null; completedAt: Date | null; durationMinutes: number | null; totalVolume: Decimal | null; status: string; difficultyRating: number | null; energyRating: number | null; notes: string | null; createdAt: Date; updatedAt: Date | null; exerciseSessions: Parameters<typeof toExerciseSessionRecord>[0][] }): WorkoutSessionRecord {
  return { id: ws.id, workoutTemplateId: ws.workoutTemplateId, customerId: ws.customerId, routineId: ws.routineId, userId: ws.userId, titleSnapshot: ws.titleSnapshot, startedAt: ws.startedAt.toISOString(), finishedAt: ws.finishedAt?.toISOString() ?? null, completedAt: ws.completedAt?.toISOString() ?? null, durationMinutes: ws.durationMinutes, totalVolume: ws.totalVolume ? Number(ws.totalVolume) : null, status: ws.status, difficultyRating: ws.difficultyRating, energyRating: ws.energyRating, notes: ws.notes ?? null, exerciseSessions: ws.exerciseSessions.map(toExerciseSessionRecord), createdAt: ws.createdAt.toISOString(), updatedAt: (ws.updatedAt ?? ws.createdAt).toISOString() };
}

export async function completeWorkoutSession(customerId: string, input: CompleteWorkoutSessionInput): Promise<WorkoutSessionRecord> {
  const template = await prisma.workoutTemplate.findUnique({ where: { id: input.workoutTemplateId } });
  const titleSnapshot = input.titleSnapshot ?? template?.title ?? "Treino";
  const totalVolume = input.exercises.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + (set.load ?? 0) * (set.reps ?? 0), 0), 0);

  const ws = await prisma.workoutSession.create({
    data: {
      customerId,
      workoutTemplateId: input.workoutTemplateId,
      routineId: input.routineId ?? null,
      titleSnapshot,
      startedAt: new Date(),
      finishedAt: new Date(),
      completedAt: new Date(),
      durationMinutes: input.durationMinutes ?? null,
      totalVolume,
      status: "C",
      difficultyRating: input.difficultyRating ?? null,
      energyRating: input.energyRating ?? null,
      notes: input.notes ?? null,
      exerciseSessions: {
        create: input.exercises.map((ex) => ({
          exerciseTemplateId: ex.exerciseTemplateId ?? null,
          exerciseId: ex.exerciseId ?? null,
          order: ex.order ?? 0,
          completedSets: ex.completedSets ?? ex.sets.filter((s) => s.completed !== false).length,
          completedReps: ex.completedReps ?? null,
          status: "C",
          startedAt: new Date(),
          completedAt: new Date(),
          setSessions: {
            create: ex.sets.map((s) => ({
              setNumber: s.setNumber,
              load: s.load ?? null,
              reps: s.reps ?? null,
              restSeconds: s.restSeconds ?? null,
              completed: s.completed ?? true,
              notes: s.notes ?? null,
              startedAt: new Date(),
              completedAt: new Date(),
            })),
          },
        })),
      },
    },
    include: includeRelations,
  });
  return toWorkoutSessionRecord(ws);
}

export async function findWorkoutSessionById(id: string): Promise<WorkoutSessionRecord | undefined> {
  const ws = await prisma.workoutSession.findUnique({ where: { id }, include: includeRelations });
  return ws ? toWorkoutSessionRecord(ws) : undefined;
}

export async function listWorkoutSessionHistory(customerId: string, params: { page: number; limit: number }): Promise<{ data: WorkoutSessionRecord[]; total: number }> {
  const skip = (params.page - 1) * params.limit;
  const where = { customerId };
  const [rows, total] = await Promise.all([
    prisma.workoutSession.findMany({ where, skip, take: params.limit, include: includeRelations, orderBy: { createdAt: "desc" } }),
    prisma.workoutSession.count({ where }),
  ]);
  return { data: rows.map(toWorkoutSessionRecord), total };
}

export async function listCustomerWorkoutHistory(customerId: string): Promise<WorkoutSessionRecord[]> {
  const rows = await prisma.workoutSession.findMany({ where: { customerId }, include: includeRelations, orderBy: { createdAt: "desc" } });
  return rows.map(toWorkoutSessionRecord);
}

export async function getPreviousExerciseData(userId: string, exerciseId: string) {
  const session = await prisma.exerciseSession.findFirst({
    where: { OR: [{ workoutSession: { customerId: userId } }, { workoutSession: { userId } }], exerciseId, status: "C" },
    include: { setSessions: { orderBy: { setNumber: "asc" } } },
    orderBy: { completedAt: "desc" },
  });
  if (!session) return null;
  return { exerciseId, sets: session.setSessions.map((s) => ({ setNumber: s.setNumber, load: s.load ? Number(s.load) : null, reps: s.reps })) };
}

export async function getExerciseHistory(userId: string, exerciseId: string) {
  const sessions = await prisma.exerciseSession.findMany({
    where: { OR: [{ workoutSession: { customerId: userId } }, { workoutSession: { userId } }], exerciseId, status: "C" },
    include: { setSessions: { orderBy: { setNumber: "asc" } }, workoutSession: { select: { completedAt: true } } },
    orderBy: { completedAt: "desc" },
    take: 20,
  });
  return sessions.map((s) => ({ date: s.workoutSession?.completedAt?.toISOString() ?? s.completedAt?.toISOString() ?? null, sets: s.setSessions.map((ss) => ({ setNumber: ss.setNumber, load: ss.load ? Number(ss.load) : null, reps: ss.reps })) }));
}
`);

write('src/modules/workout-session/workout-session.service.ts', `import { AppError } from "../../common/app-error";
import {
  completeWorkoutSession as completeInStore,
  findWorkoutSessionById,
  getExerciseHistory,
  getPreviousExerciseData,
  listCustomerWorkoutHistory,
  listWorkoutSessionHistory,
} from "./workout-session.store";
import { CompleteWorkoutSessionInput } from "./workout-session.types";

export async function completeSession(customerId: string, input: CompleteWorkoutSessionInput) {
  return completeInStore(customerId, input);
}

export async function getSessionById(id: string) {
  const session = await findWorkoutSessionById(id);
  if (!session) throw new AppError("Workout session not found", 404);
  return session;
}

export async function getWorkoutHistory(customerId: string, params: { page: number; limit: number }) {
  return listWorkoutSessionHistory(customerId, params);
}

export async function getCustomerHistory(customerId: string) {
  return listCustomerWorkoutHistory(customerId);
}

export async function getPreviousExercise(userId: string, exerciseId: string) {
  return getPreviousExerciseData(userId, exerciseId);
}

export async function getExerciseHistoryService(userId: string, exerciseId: string) {
  return getExerciseHistory(userId, exerciseId);
}
`);

write('src/modules/workout-session/workout-session.controller.ts', `import { Request, Response } from "express";
import { completeWorkoutSessionSchema, sessionHistoryQuerySchema } from "./workout-session.schemas";
import {
  completeSession, getCustomerHistory, getExerciseHistoryService, getPreviousExercise,
  getSessionById, getWorkoutHistory,
} from "./workout-session.service";

export async function completeSessionHandler(request: Request, response: Response) {
  const payload = completeWorkoutSessionSchema.parse(request.body);
  return response.status(201).json(await completeSession(request.user!.id, payload));
}
export async function getSessionByIdHandler(request: Request, response: Response) {
  return response.status(200).json(await getSessionById(request.params.id));
}
export async function getHistoryHandler(request: Request, response: Response) {
  const query = sessionHistoryQuerySchema.parse(request.query);
  const result = await getWorkoutHistory(request.user!.id, query);
  return response.status(200).json({ data: result.data, total: result.total, page: query.page, limit: query.limit });
}
export async function getPreviousExerciseHandler(request: Request, response: Response) {
  const data = await getPreviousExercise(request.user!.id, request.params.exerciseId);
  return response.status(200).json(data);
}
export async function getExerciseHistoryHandler(request: Request, response: Response) {
  const data = await getExerciseHistoryService(request.user!.id, request.params.exerciseId);
  return response.status(200).json(data);
}
export async function getCustomerHistoryHandler(request: Request, response: Response) {
  return response.status(200).json(await getCustomerHistory(request.params.customerId));
}
`);

// ─── storage module (MinIO) ───────────────────────────────────────────────────

write('src/modules/storage/storage.service.ts', `import * as Minio from "minio";
import { AppError } from "../../common/app-error";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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

export async function uploadFile(buffer: Buffer, mimeType: string, originalName: string, folder = "uploads"): Promise<string> {
  if (!ALLOWED_TYPES.includes(mimeType)) throw new AppError("File type not allowed", 400);
  if (buffer.length > MAX_SIZE_BYTES) throw new AppError("File too large (max 5MB)", 400);

  const ext = originalName.split(".").pop() ?? "jpg";
  const objectName = \`\${folder}/\${Date.now()}-\${Math.random().toString(36).slice(2)}.\${ext}\`;
  const client = getClient();

  await client.putObject(BUCKET, objectName, buffer, buffer.length, { "Content-Type": mimeType });

  const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
  const port = process.env.MINIO_PORT ?? "9000";
  const ssl = process.env.MINIO_USE_SSL === "true";
  return \`\${ssl ? "https" : "http"}://\${endpoint}:\${port}/\${BUCKET}/\${objectName}\`;
}

export async function deleteFile(objectName: string): Promise<void> {
  const client = getClient();
  await client.removeObject(BUCKET, objectName);
}

export async function getPresignedUrl(objectName: string, expirySeconds = 3600): Promise<string> {
  const client = getClient();
  return client.presignedGetObject(BUCKET, objectName, expirySeconds);
}
`);

write('src/modules/storage/storage.controller.ts', `import { Request, Response } from "express";
import { AppError } from "../../common/app-error";
import { deleteFile, getPresignedUrl, uploadFile } from "./storage.service";
import { prisma } from "../../prisma";

export async function uploadImageHandler(request: Request, response: Response) {
  const file = (request as unknown as { file?: { buffer: Buffer; mimetype: string; originalname: string } }).file;
  if (!file) throw new AppError("No file provided", 400);
  const url = await uploadFile(file.buffer, file.mimetype, file.originalname);
  return response.status(200).json({ url });
}

export async function uploadExerciseMediaHandler(request: Request, response: Response) {
  const file = (request as unknown as { file?: { buffer: Buffer; mimetype: string; originalname: string } }).file;
  if (!file) throw new AppError("No file provided", 400);
  const { exerciseId } = request.params;
  const url = await uploadFile(file.buffer, file.mimetype, file.originalname, "exercises");
  await prisma.exercise.update({ where: { id: exerciseId }, data: { imageUrl: url } });
  return response.status(200).json({ url });
}

export async function deleteExerciseMediaHandler(request: Request, response: Response) {
  const { exerciseId } = request.params;
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise?.imageUrl) throw new AppError("Exercise has no media", 404);
  const objectName = exercise.imageUrl.split("/").slice(-2).join("/");
  await deleteFile(objectName);
  await prisma.exercise.update({ where: { id: exerciseId }, data: { imageUrl: null } });
  return response.status(204).send();
}

export async function deleteImageHandler(request: Request, response: Response) {
  const objectName = decodeURIComponent(request.params.objectName);
  await deleteFile(objectName);
  return response.status(204).send();
}

export async function getPresignedUrlHandler(request: Request, response: Response) {
  const objectName = decodeURIComponent(request.params.objectName);
  const url = await getPresignedUrl(objectName);
  return response.status(200).json({ url });
}
`);

// ─── push module ──────────────────────────────────────────────────────────────

write('src/modules/push/push.types.ts', `export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
  userAgent?: string;
}
`);

write('src/modules/push/push.schemas.ts', `import { z } from "zod";

export const subscribeSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  expirationTime: z.number().optional().nullable(),
  userAgent: z.string().optional(),
});

export const notifySchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(500).optional(),
  url: z.string().optional(),
});
`);

write('src/modules/push/push.service.ts', `import webpush from "web-push";
import { prisma } from "../../prisma";
import { PushSubscriptionInput } from "./push.types";

let _initialized = false;

function initWebPush() {
  if (_initialized) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@nutrifit.app";
  if (publicKey && privateKey) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    _initialized = true;
  }
}

export async function subscribePush(userId: string, input: PushSubscriptionInput): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    update: { p256dh: input.keys.p256dh, auth: input.keys.auth, isActive: true, expirationTime: input.expirationTime ? new Date(input.expirationTime) : null, userAgent: input.userAgent ?? null },
    create: { userId, endpoint: input.endpoint, p256dh: input.keys.p256dh, auth: input.keys.auth, isActive: true, expirationTime: input.expirationTime ? new Date(input.expirationTime) : null, userAgent: input.userAgent ?? null },
  });
}

export async function unsubscribePush(userId: string, endpoint: string): Promise<void> {
  await prisma.pushSubscription.updateMany({ where: { userId, endpoint }, data: { isActive: false } });
}

export async function notifyUser(userId: string, payload: { title: string; body?: string; url?: string }): Promise<{ sent: number; failed: number }> {
  initWebPush();
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId, isActive: true } });
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload));
      sent++;
    } catch (err: unknown) {
      failed++;
      if ((err as { statusCode?: number }).statusCode === 410) {
        await prisma.pushSubscription.update({ where: { id: sub.id }, data: { isActive: false } });
      }
    }
  }
  return { sent, failed };
}
`);

write('src/modules/push/push.controller.ts', `import { Request, Response } from "express";
import { AppError } from "../../common/app-error";
import { notifySchema, subscribeSchema } from "./push.schemas";
import { notifyUser, subscribePush, unsubscribePush } from "./push.service";

export async function subscribeHandler(request: Request, response: Response) {
  const payload = subscribeSchema.parse(request.body);
  await subscribePush(request.user!.id, payload);
  return response.status(201).json({ message: "Subscribed" });
}

export async function unsubscribeHandler(request: Request, response: Response) {
  const { endpoint } = request.body as { endpoint?: string };
  if (!endpoint) throw new AppError("endpoint required", 400);
  await unsubscribePush(request.user!.id, endpoint);
  return response.status(200).json({ message: "Unsubscribed" });
}

export async function notifyUserHandler(request: Request, response: Response) {
  if (!request.user?.isAdmin) throw new AppError("Forbidden", 403);
  const payload = notifySchema.parse(request.body);
  const result = await notifyUser(request.params.userId, payload);
  return response.status(200).json(result);
}
`);

// ─── unit tests ──────────────────────────────────────────────────────────────

write('tests/unit/exercise.service.spec.ts', `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/exercise/exercise.store");

import * as store from "../../src/modules/exercise/exercise.store";
import {
  createExercise,
  deleteExercise,
  getExerciseById,
  updateExercise,
} from "../../src/modules/exercise/exercise.service";

const mockExercise = {
  id: "ex-1", categoryId: "cat-1", category: { id: "cat-1", name: "Força" },
  name: "Supino", instruction: null, imageUrl: null, videoUrl: null,
  createdByUserId: "user-1", isPublished: false, status: "A",
  primaryMuscles: [], secondaryMuscles: [],
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

describe("exercise.service", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("getExerciseById throws 404 for unknown exercise", async () => {
    vi.mocked(store.findExerciseById).mockResolvedValue(undefined);
    await expect(getExerciseById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("deleteExercise throws 403 when non-owner tries to delete", async () => {
    vi.mocked(store.findExerciseById).mockResolvedValue(mockExercise);
    await expect(deleteExercise("other-user", "ex-1", false)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("deleteExercise allows admin to delete any exercise", async () => {
    vi.mocked(store.findExerciseById).mockResolvedValue(mockExercise);
    vi.mocked(store.softDeleteExercise).mockResolvedValue(undefined);
    await expect(deleteExercise("admin-id", "ex-1", true)).resolves.not.toThrow();
  });

  it("updateExercise throws 403 when non-owner tries to update", async () => {
    vi.mocked(store.findExerciseById).mockResolvedValue(mockExercise);
    await expect(updateExercise("other-user", "ex-1", { name: "Changed" }, false)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("createExercise returns exercise record", async () => {
    vi.mocked(store.createExercise).mockResolvedValue(mockExercise);
    const result = await createExercise("user-1", { name: "Supino", categoryId: "cat-1" });
    expect(result).toEqual(mockExercise);
  });
});
`);

write('tests/unit/bond.service.spec.ts', `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/bond/bond.store");

import * as store from "../../src/modules/bond/bond.store";
import { createBond, deleteBond, getBondById, updateBond } from "../../src/modules/bond/bond.service";

const mockBond = {
  id: "bond-1", customerId: "user-1", professionalId: "prof-1", senderId: "user-1",
  status: "P", customer: null, professional: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

describe("bond.service", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("getBondById throws 404 for unknown bond", async () => {
    vi.mocked(store.findBondById).mockResolvedValue(undefined);
    await expect(getBondById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("updateBond throws 403 when non-participant tries to update", async () => {
    vi.mocked(store.findBondById).mockResolvedValue(mockBond);
    await expect(updateBond("stranger", "bond-1", { status: "A" }, false)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("deleteBond throws 403 when non-participant tries to delete", async () => {
    vi.mocked(store.findBondById).mockResolvedValue(mockBond);
    vi.mocked(store.deleteBond).mockResolvedValue(undefined);
    await expect(deleteBond("stranger", "bond-1", false)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("createBond calls store", async () => {
    vi.mocked(store.createBond).mockResolvedValue(mockBond);
    const result = await createBond("user-1", { customerId: "user-1", professionalId: "prof-1" });
    expect(result).toEqual(mockBond);
  });
});
`);

write('tests/unit/routine.service.spec.ts', `import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/routine/routine.store");

import * as store from "../../src/modules/routine/routine.store";
import { createRoutine, deleteRoutine, getRoutineById, updateRoutine } from "../../src/modules/routine/routine.service";

const mockRoutine = {
  id: "routine-1", personalId: "personal-1", title: "Treino A", goal: null,
  difficulty: null, weeks: null, status: "A", personal: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

describe("routine.service", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("getRoutineById throws 404 for unknown routine", async () => {
    vi.mocked(store.findRoutineById).mockResolvedValue(undefined);
    await expect(getRoutineById("nonexistent")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("updateRoutine throws 403 when non-owner tries to update", async () => {
    vi.mocked(store.findRoutineById).mockResolvedValue(mockRoutine);
    await expect(updateRoutine("other-user", "routine-1", {}, false)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("deleteRoutine throws 403 when non-owner tries to delete", async () => {
    vi.mocked(store.findRoutineById).mockResolvedValue(mockRoutine);
    vi.mocked(store.softDeleteRoutine).mockResolvedValue(undefined);
    await expect(deleteRoutine("other-user", "routine-1", false)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("createRoutine returns routine record", async () => {
    vi.mocked(store.createRoutine).mockResolvedValue(mockRoutine);
    const result = await createRoutine("personal-1", { title: "Treino A" });
    expect(result).toEqual(mockRoutine);
  });
});
`);

// ─── integration tests ────────────────────────────────────────────────────────

write('tests/integration/exercise.route.spec.ts', `import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { errorHandler } from "../../src/common/error-handler";
import { registerSelfManaged } from "../../src/modules/auth/auth.controller";
import { ensureAuthenticated } from "../../src/modules/auth/auth.middleware";
import { listCategoriesHandler, listMuscleGroupsHandler, listExercisesHandler } from "../../src/modules/exercise/exercise.controller";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.post("/auth/self-managed/register", registerSelfManaged);
  app.get("/exercises", ensureAuthenticated, listExercisesHandler);
  app.get("/exercises/categories", ensureAuthenticated, listCategoriesHandler);
  app.get("/exercises/muscle-groups", ensureAuthenticated, listMuscleGroupsHandler);
  app.use(errorHandler);
  return app;
}

describe("exercise routes", () => {
  beforeEach(async () => {
    await resetSelfManagedStore();
  });

  it("GET /exercises/categories returns 200 with array", async () => {
    const app = createTestApp();
    const reg = await request(app).post("/auth/self-managed/register").send({ name: "TestUser", email: "extest@mail.com", password: "password123" });
    const token = reg.body.token as string;
    const res = await request(app).get("/exercises/categories").set("Authorization", \`Bearer \${token}\`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /exercises/muscle-groups returns 200 with array", async () => {
    const app = createTestApp();
    const reg = await request(app).post("/auth/self-managed/register").send({ name: "TestUser2", email: "extest2@mail.com", password: "password123" });
    const token = reg.body.token as string;
    const res = await request(app).get("/exercises/muscle-groups").set("Authorization", \`Bearer \${token}\`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /exercises returns 200 with paginated data", async () => {
    const app = createTestApp();
    const reg = await request(app).post("/auth/self-managed/register").send({ name: "TestUser3", email: "extest3@mail.com", password: "password123" });
    const token = reg.body.token as string;
    const res = await request(app).get("/exercises").set("Authorization", \`Bearer \${token}\`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
  });
});
`);

write('tests/integration/bond.route.spec.ts', `import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { errorHandler } from "../../src/common/error-handler";
import { registerSelfManaged } from "../../src/modules/auth/auth.controller";
import { ensureAuthenticated } from "../../src/modules/auth/auth.middleware";
import { getMyBondsHandler } from "../../src/modules/bond/bond.controller";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.post("/auth/self-managed/register", registerSelfManaged);
  app.get("/bonds/my-bonds", ensureAuthenticated, getMyBondsHandler);
  app.use(errorHandler);
  return app;
}

describe("bond routes", () => {
  beforeEach(async () => {
    await resetSelfManagedStore();
  });

  it("GET /bonds/my-bonds returns 200 with empty array for new user", async () => {
    const app = createTestApp();
    const reg = await request(app).post("/auth/self-managed/register").send({ name: "BondUser", email: "bonduser@mail.com", password: "password123" });
    const token = reg.body.token as string;
    const res = await request(app).get("/bonds/my-bonds").set("Authorization", \`Bearer \${token}\`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
`);

write('tests/integration/routine.route.spec.ts', `import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { errorHandler } from "../../src/common/error-handler";
import { registerSelfManaged } from "../../src/modules/auth/auth.controller";
import { ensureAuthenticated } from "../../src/modules/auth/auth.middleware";
import { createRoutineHandler, listMyRoutinesHandler } from "../../src/modules/routine/routine.controller";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.post("/auth/self-managed/register", registerSelfManaged);
  app.get("/routines/my-routines", ensureAuthenticated, listMyRoutinesHandler);
  app.post("/routines", ensureAuthenticated, createRoutineHandler);
  app.use(errorHandler);
  return app;
}

describe("routine routes", () => {
  beforeEach(async () => {
    await resetSelfManagedStore();
  });

  it("creates a routine and lists it", async () => {
    const app = createTestApp();
    const reg = await request(app).post("/auth/self-managed/register").send({ name: "Trainer", email: "trainer@mail.com", password: "password123" });
    const token = reg.body.token as string;

    const createRes = await request(app).post("/routines").set("Authorization", \`Bearer \${token}\`).send({ title: "Hipertrofia 12 Semanas", goal: "Ganhar massa", weeks: 12 });
    expect(createRes.status).toBe(201);
    expect(createRes.body.title).toBe("Hipertrofia 12 Semanas");

    const listRes = await request(app).get("/routines/my-routines").set("Authorization", \`Bearer \${token}\`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);
  });
});
`);

console.log('\nAll files created successfully!');
console.log('Next steps:');
console.log('  cd C:\\\\Users\\\\mauri\\\\source\\\\repos\\\\nutrifit\\\\backend-node');
console.log('  npx tsc --noEmit');
console.log('  npm run test:unit');
