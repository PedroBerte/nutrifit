#!/usr/bin/env node
// Run this once to scaffold ALL directories and module files.
// Usage: node init-structure.js
// Then: npm install && npx prisma generate
const fs = require("fs");
const path = require("path");

const root = __dirname;

function writeFile(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
  console.log("  created:", relPath);
}

console.log("Creating directory structure...");

writeFile(
  "prisma/schema.prisma",
  `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Profile {
  id        String    @id @default(uuid())
  name      String    @unique
  status    String    @default("A")
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  users     User[]
}

model User {
  id           String    @id @default(uuid())
  profileId    String
  addressId    String?
  name         String
  email        String    @unique
  imageUrl     String?
  password     String    @default("")
  passwordHash String?
  sex          String    @default("")
  dateOfBirth  DateTime  @default(now())
  phoneNumber  String    @default("")
  isAdmin      Boolean   @default(false)
  status       String    @default("A")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime? @updatedAt

  profile                   Profile                    @relation(fields: [profileId], references: [id])
  address                   Address?                   @relation(fields: [addressId], references: [id])
  professionalCredential    ProfessionalCredential?
  professionalDetails       ProfessionalDetails?
  bondsAsCustomer           CustomerProfessionalBond[] @relation("BondCustomer")
  bondsAsProfessional       CustomerProfessionalBond[] @relation("BondProfessional")
  bondsAsSender             CustomerProfessionalBond[] @relation("BondSender")
  favoritesGiven            FavoriteProfessional[]     @relation("FavoriteCustomer")
  favoritesReceived         FavoriteProfessional[]     @relation("FavoriteProfessional")
  feedbacksGiven            CustomerFeedback[]         @relation("FeedbackCustomer")
  feedbacksReceived         CustomerFeedback[]         @relation("FeedbackProfessional")
  routinesCreated           Routine[]                  @relation("RoutinePersonal")
  workoutSessionsAsCustomer WorkoutSession[]           @relation("SessionCustomer")
  customerRoutines          CustomerRoutine[]          @relation("CustomerRoutineUser")
  exercises                 Exercise[]
  pushSubscriptions         PushSubscription[]
  weeklyGoals               WeeklyGoal[]
  workoutTemplates          WorkoutTemplate[]
  workoutSessions           WorkoutSession[]           @relation("SelfManagedSessions")
}

model Address {
  id          String    @id @default(uuid())
  addressLine String
  number      String?
  city        String
  state       String?
  zipCode     String?
  country     String
  addressType Int       @default(0)
  latitude    Float?
  longitude   Float?
  status      String    @default("A")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime? @updatedAt

  users        User[]
  appointments Appointment[]
}

model ProfessionalCredential {
  id             String    @id @default(uuid())
  professionalId String    @unique
  type           String
  credentialId   String?
  biography      String?
  status         String    @default("A")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime? @updatedAt

  professional User @relation(fields: [professionalId], references: [id])
}

model ProfessionalDetails {
  id             String    @id @default(uuid())
  professionalId String    @unique
  attendanceMode Int       @default(0)
  tag1           String?
  tag2           String?
  tag3           String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime? @updatedAt

  professional User @relation(fields: [professionalId], references: [id])
}

model CustomerProfessionalBond {
  id             String    @id @default(uuid())
  customerId     String
  professionalId String
  senderId       String
  status         String    @default("P")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime? @updatedAt

  customer     User @relation("BondCustomer", fields: [customerId], references: [id])
  professional User @relation("BondProfessional", fields: [professionalId], references: [id])
  sender       User @relation("BondSender", fields: [senderId], references: [id])

  appointments Appointment[]
}

model FavoriteProfessional {
  id             String   @id @default(uuid())
  customerId     String
  professionalId String
  createdAt      DateTime @default(now())

  customer     User @relation("FavoriteCustomer", fields: [customerId], references: [id])
  professional User @relation("FavoriteProfessional", fields: [professionalId], references: [id])

  @@unique([customerId, professionalId])
}

model CustomerFeedback {
  id             String    @id @default(uuid())
  professionalId String
  customerId     String
  testimony      String?
  rate           Int
  type           Int       @default(0)
  status         String    @default("A")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime? @updatedAt

  professional User @relation("FeedbackProfessional", fields: [professionalId], references: [id])
  customer     User @relation("FeedbackCustomer", fields: [customerId], references: [id])
}

model Appointment {
  id                         String    @id @default(uuid())
  customerProfessionalBondId String
  scheduledAt                DateTime
  type                       String    @default("PR")
  addressId                  String?
  status                     String    @default("P")
  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime? @updatedAt

  bond    CustomerProfessionalBond @relation(fields: [customerProfessionalBondId], references: [id])
  address Address?                 @relation(fields: [addressId], references: [id])
}

model ExerciseCategory {
  id        String    @id @default(uuid())
  name      String    @unique
  status    String    @default("A")
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt

  exercises Exercise[]
}

model MuscleGroup {
  id        String    @id @default(uuid())
  name      String    @unique
  status    String    @default("A")
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt

  muscles Muscle[]
}

model Muscle {
  id            String    @id @default(uuid())
  muscleGroupId String
  name          String
  status        String    @default("A")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime? @updatedAt

  muscleGroup              MuscleGroup               @relation(fields: [muscleGroupId], references: [id])
  primaryMuscleExercises   ExercisePrimaryMuscle[]
  secondaryMuscleExercises ExerciseSecondaryMuscle[]
}

model Exercise {
  id              String    @id @default(uuid())
  categoryId      String
  name            String
  instruction     String?
  imageUrl        String?
  videoUrl        String?
  createdByUserId String?
  isPublished     Boolean   @default(false)
  status          String    @default("A")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime? @updatedAt

  category          ExerciseCategory          @relation(fields: [categoryId], references: [id])
  createdByUser     User?                     @relation(fields: [createdByUserId], references: [id])
  primaryMuscles    ExercisePrimaryMuscle[]
  secondaryMuscles  ExerciseSecondaryMuscle[]
  exerciseTemplates ExerciseTemplate[]
  exerciseSessions  ExerciseSession[]
}

model ExercisePrimaryMuscle {
  id         String    @id @default(uuid())
  muscleId   String
  exerciseId String
  status     String    @default("A")
  createdAt  DateTime  @default(now())
  updatedAt  DateTime? @updatedAt

  muscle   Muscle   @relation(fields: [muscleId], references: [id])
  exercise Exercise @relation(fields: [exerciseId], references: [id])

  @@unique([muscleId, exerciseId])
}

model ExerciseSecondaryMuscle {
  id         String    @id @default(uuid())
  muscleId   String
  exerciseId String
  status     String    @default("A")
  createdAt  DateTime  @default(now())
  updatedAt  DateTime? @updatedAt

  muscle   Muscle   @relation(fields: [muscleId], references: [id])
  exercise Exercise @relation(fields: [exerciseId], references: [id])

  @@unique([muscleId, exerciseId])
}

model Routine {
  id         String    @id @default(uuid())
  personalId String
  title      String
  goal       String?
  difficulty String?
  weeks      Int?
  status     String    @default("A")
  createdAt  DateTime  @default(now())
  updatedAt  DateTime? @updatedAt

  personal         User              @relation("RoutinePersonal", fields: [personalId], references: [id])
  workoutTemplates WorkoutTemplate[]
  customerRoutines CustomerRoutine[]
  workoutSessions  WorkoutSession[]
}

model CustomerRoutine {
  id         String    @id @default(uuid())
  routineId  String
  customerId String
  status     String    @default("A")
  expiresAt  DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime? @updatedAt

  routine  Routine @relation(fields: [routineId], references: [id])
  customer User    @relation("CustomerRoutineUser", fields: [customerId], references: [id])

  @@unique([routineId, customerId])
}

model WorkoutTemplate {
  id                       String    @id @default(uuid())
  routineId                String?
  userId                   String?
  title                    String
  description              String?
  notes                    String?
  estimatedDurationMinutes Int?
  order                    Int       @default(0)
  status                   String    @default("A")
  createdAt                DateTime  @default(now())
  updatedAt                DateTime? @updatedAt

  routine           Routine?           @relation(fields: [routineId], references: [id])
  user              User?              @relation(fields: [userId], references: [id])
  exerciseTemplates ExerciseTemplate[]
  workoutSessions   WorkoutSession[]
}

model ExerciseTemplate {
  id                String    @id @default(uuid())
  workoutTemplateId String
  exerciseId        String
  order             Int       @default(0)
  targetSets        Int       @default(0)
  targetRepsMin     Int?
  targetRepsMax     Int?
  suggestedLoad     Decimal?
  restSeconds       Int?
  notes             String?
  status            String    @default("A")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime? @updatedAt

  workoutTemplate  WorkoutTemplate   @relation(fields: [workoutTemplateId], references: [id])
  exercise         Exercise          @relation(fields: [exerciseId], references: [id])
  exerciseSessions ExerciseSession[]
}

model WorkoutSession {
  id                String    @id @default(uuid())
  workoutTemplateId String?
  customerId        String?
  routineId         String?
  userId            String?
  titleSnapshot     String?
  startedAt         DateTime  @default(now())
  finishedAt        DateTime?
  completedAt       DateTime?
  durationMinutes   Int?
  totalVolume       Decimal?
  status            String    @default("IP")
  difficultyRating  Int?
  energyRating      Int?
  notes             String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime? @updatedAt

  workoutTemplate  WorkoutTemplate?  @relation(fields: [workoutTemplateId], references: [id])
  customer         User?             @relation("SessionCustomer", fields: [customerId], references: [id])
  routine          Routine?          @relation(fields: [routineId], references: [id])
  selfManagedUser  User?             @relation("SelfManagedSessions", fields: [userId], references: [id])
  exerciseSessions ExerciseSession[]
}

model ExerciseSession {
  id                 String    @id @default(uuid())
  workoutSessionId   String
  exerciseTemplateId String?
  exerciseId         String?
  order              Int       @default(0)
  startedAt          DateTime?
  completedAt        DateTime?
  status             String    @default("NS")
  notes              String?
  plannedSets        Int?
  plannedReps        Int?
  completedSets      Int?
  completedReps      Int?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime? @updatedAt

  workoutSession   WorkoutSession    @relation(fields: [workoutSessionId], references: [id])
  exerciseTemplate ExerciseTemplate? @relation(fields: [exerciseTemplateId], references: [id])
  exercise         Exercise?         @relation(fields: [exerciseId], references: [id])
  setSessions      SetSession[]
}

model SetSession {
  id                String    @id @default(uuid())
  exerciseSessionId String
  setNumber         Int
  load              Decimal?
  reps              Int?
  restSeconds       Int?
  completed         Boolean   @default(true)
  notes             String?
  startedAt         DateTime  @default(now())
  completedAt       DateTime?
  createdAt         DateTime  @default(now())

  exerciseSession ExerciseSession @relation(fields: [exerciseSessionId], references: [id])
}

model PushSubscription {
  id             String    @id @default(uuid())
  userId         String
  endpoint       String    @unique
  p256dh         String
  auth           String
  expirationTime DateTime?
  userAgent      String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())

  user User @relation(fields: [userId], references: [id])
}

model WeeklyGoal {
  id             String    @id @default(uuid())
  userId         String
  weekStartDate  String
  targetSessions Int
  createdAt      DateTime  @default(now())
  updatedAt      DateTime? @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, weekStartDate])
}
`
);

writeFile(
  "src/lib/prisma.ts",
  `export { prisma } from "../prisma";
`
);

writeFile(
  "src/lib/redis.ts",
  `export { getRedis } from "../redis";
`
);

// ─── Auth: Magic Link ─────────────────────────────────────────────────────────

writeFile(
  "src/modules/auth/magic-link.service.ts",
  `import crypto from "node:crypto";
import { getRedis } from "../../redis";
import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";
import { createAccessToken } from "./auth.service";

const ML_TTL_SECONDS = 15 * 60; // 15 minutes

export async function sendMagicLink(
  email: string,
  baseAppUrl: string,
  _ip?: string,
  _ua?: string,
  invited?: boolean,
  professionalInviterId?: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    // Auto-provision user with Student profile on first magic link request
    const studentProfile = await prisma.profile.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: { id: "00000000-0000-0000-0000-000000000001", name: "Student", status: "A" },
    });

    user = await prisma.user.create({
      data: {
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        profileId: studentProfile.id,
        status: "A",
        sex: "",
        phoneNumber: "",
      },
    });

    // Handle professional inviter bond creation stub
    if (invited && professionalInviterId) {
      const personalProfile = await prisma.profile.findUnique({
        where: { id: "00000000-0000-0000-0000-000000000002" },
      });
      const professional = await prisma.user.findFirst({
        where: { id: professionalInviterId, profileId: personalProfile?.id },
      });
      if (professional) {
        await prisma.customerProfessionalBond.create({
          data: {
            customerId: user.id,
            professionalId: professional.id,
            senderId: professional.id,
            status: "P",
          },
        });
      }
    }
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const redis = getRedis();
  await redis.set(\`ml:\${tokenHash}\`, user.id, "EX", ML_TTL_SECONDS);

  // In production, send email. For now, log to console.
  const magicUrl = \`\${baseAppUrl}/auth/validate?token=\${rawToken}\`;
  console.log(\`[MagicLink] \${normalizedEmail} → \${magicUrl}\`);
}

export async function validateMagicLink(rawToken: string): Promise<string> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const redis = getRedis();

  const userId = await redis.get(\`ml:\${tokenHash}\`);
  if (!userId) {
    throw new AppError("Invalid or expired magic link token", 401);
  }

  await redis.del(\`ml:\${tokenHash}\`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const claims = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    profile: user.profile.name,
  };

  return createAccessToken(claims);
}
`
);

// ─── Module: Users ─────────────────────────────────────────────────────────────

writeFile(
  "src/modules/users/users.schemas.ts",
  `import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  profileId: z.string().uuid(),
  sex: z.string().optional().default(""),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional().default(""),
  imageUrl: z.string().url().optional(),
});

export const updateUserSchema = createUserSchema.partial();
`
);

writeFile(
  "src/modules/users/users.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getAllUsers(
  requestingUserId?: string,
  filter?: { userLat?: number; userLon?: number; maxDistanceKm?: number }
) {
  const users = await prisma.user.findMany({
    where: { status: "A" },
    include: {
      profile: true,
      address: true,
      professionalCredential: true,
      professionalDetails: true,
    },
  });

  const enriched = await Promise.all(
    users.map(async (user) => {
      let isFavorite = false;
      let avgRating: number | null = null;
      let totalFeedbacks = 0;

      if (user.professionalCredential) {
        const feedbacks = await prisma.customerFeedback.findMany({
          where: { professionalId: user.id, status: "A" },
        });
        totalFeedbacks = feedbacks.length;
        avgRating =
          feedbacks.length > 0
            ? Math.round((feedbacks.reduce((sum, f) => sum + f.rate, 0) / feedbacks.length) * 100) / 100
            : null;

        if (requestingUserId) {
          const fav = await prisma.favoriteProfessional.findUnique({
            where: { customerId_professionalId: { customerId: requestingUserId, professionalId: user.id } },
          });
          isFavorite = !!fav;
        }
      }

      return {
        ...user,
        password: undefined,
        passwordHash: undefined,
        averageRating: avgRating,
        totalFeedbacks,
        isFavorite,
      };
    })
  );

  if (filter?.userLat != null && filter?.userLon != null && filter?.maxDistanceKm != null) {
    return enriched.filter((u) => {
      if (!u.address?.latitude || !u.address?.longitude) return false;
      return calculateDistance(filter.userLat!, filter.userLon!, u.address.latitude, u.address.longitude) <= filter.maxDistanceKm!;
    });
  }

  return enriched;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true, address: true, professionalCredential: true, professionalDetails: true },
  });
  if (!user) throw new AppError("User not found", 404);
  return { ...user, password: undefined, passwordHash: undefined };
}

export async function updateUser(id: string, data: Partial<{ name: string; imageUrl: string; sex: string; phoneNumber: string; dateOfBirth: Date }>) {
  const user = await prisma.user.update({ where: { id }, data });
  return { ...user, password: undefined, passwordHash: undefined };
}

export async function deleteUser(id: string) {
  await prisma.user.update({ where: { id }, data: { status: "I" } });
}

export async function getProfessionalFeedbacks(professionalId: string) {
  return prisma.customerFeedback.findMany({
    where: { professionalId, status: "A" },
    include: { customer: { select: { id: true, name: true } } },
  });
}
`
);

writeFile(
  "src/modules/users/users.controller.ts",
  `import { Request, Response } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser, getProfessionalFeedbacks } from "./users.service";
import { updateUserSchema } from "./users.schemas";

export async function listUsers(req: Request, res: Response) {
  const { userLat, userLon, maxDistanceKm } = req.query as Record<string, string>;
  const requestingUserId = req.user?.id;
  const users = await getAllUsers(requestingUserId, {
    userLat: userLat ? parseFloat(userLat) : undefined,
    userLon: userLon ? parseFloat(userLon) : undefined,
    maxDistanceKm: maxDistanceKm ? parseInt(maxDistanceKm) : undefined,
  });
  return res.status(200).json(users);
}

export async function getUser(req: Request, res: Response) {
  const user = await getUserById(req.params.id);
  return res.status(200).json(user);
}

export async function updateUserHandler(req: Request, res: Response) {
  const payload = updateUserSchema.parse(req.body);
  const updated = await updateUser(req.params.id, payload as Parameters<typeof updateUser>[1]);
  return res.status(200).json(updated);
}

export async function deleteUserHandler(req: Request, res: Response) {
  await deleteUser(req.params.id);
  return res.status(204).send();
}

export async function getUserFeedbacks(req: Request, res: Response) {
  const feedbacks = await getProfessionalFeedbacks(req.params.id);
  return res.status(200).json(feedbacks);
}
`
);

// ─── Module: Bonds ──────────────────────────────────────────────────────────────

writeFile(
  "src/modules/bonds/bonds.schemas.ts",
  `import { z } from "zod";

export const createBondSchema = z.object({
  customerId: z.string().uuid(),
  professionalId: z.string().uuid(),
});

export const updateBondSchema = z.object({
  status: z.enum(["P", "A", "R", "C"]),
});
`
);

writeFile(
  "src/modules/bonds/bonds.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

const bondInclude = {
  customer: { select: { id: true, name: true, email: true, imageUrl: true } },
  professional: { select: { id: true, name: true, email: true, imageUrl: true, professionalCredential: true } },
  sender: { select: { id: true, name: true, email: true } },
} as const;

export async function getAllBonds() {
  return prisma.customerProfessionalBond.findMany({ include: bondInclude });
}

export async function getBondById(id: string) {
  const bond = await prisma.customerProfessionalBond.findUnique({ where: { id }, include: bondInclude });
  if (!bond) throw new AppError("Bond not found", 404);
  return bond;
}

export async function getBondsBySenderId(senderId: string) {
  return prisma.customerProfessionalBond.findMany({ where: { senderId }, include: bondInclude });
}

export async function getBondsReceivedByUser(userId: string) {
  return prisma.customerProfessionalBond.findMany({
    where: { OR: [{ customerId: userId }, { professionalId: userId }], NOT: { senderId: userId } },
    include: bondInclude,
  });
}

export async function getBondsAsCustomer(customerId: string) {
  return prisma.customerProfessionalBond.findMany({ where: { customerId }, include: bondInclude });
}

export async function getBondsAsProfessional(professionalId: string) {
  return prisma.customerProfessionalBond.findMany({ where: { professionalId }, include: bondInclude });
}

export async function getBondsByUser(userId: string) {
  return prisma.customerProfessionalBond.findMany({
    where: { OR: [{ customerId: userId }, { professionalId: userId }] },
    include: bondInclude,
  });
}

export async function getActiveStudents(
  professionalId: string,
  page: number,
  pageSize: number,
  search?: string
) {
  const where = {
    professionalId,
    status: "A",
    customer: search ? { name: { contains: search, mode: "insensitive" as const } } : undefined,
  };

  const [total, bonds] = await Promise.all([
    prisma.customerProfessionalBond.count({ where }),
    prisma.customerProfessionalBond.findMany({
      where,
      include: { customer: { select: { id: true, name: true, email: true, imageUrl: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, page, pageSize, data: bonds };
}

export async function createBond(data: { customerId: string; professionalId: string; senderId: string }) {
  return prisma.customerProfessionalBond.create({ data, include: bondInclude });
}

export async function updateBond(id: string, status: string) {
  return prisma.customerProfessionalBond.update({ where: { id }, data: { status }, include: bondInclude });
}

export async function deleteBond(id: string) {
  await prisma.customerProfessionalBond.delete({ where: { id } });
}
`
);

writeFile(
  "src/modules/bonds/bonds.controller.ts",
  `import { Request, Response } from "express";
import {
  getAllBonds, getBondById, getBondsBySenderId, getBondsReceivedByUser,
  getBondsAsCustomer, getBondsAsProfessional, getBondsByUser,
  getActiveStudents, createBond, updateBond, deleteBond,
} from "./bonds.service";
import { createBondSchema, updateBondSchema } from "./bonds.schemas";

export async function listBonds(_req: Request, res: Response) {
  return res.json(await getAllBonds());
}
export async function getBond(req: Request, res: Response) {
  return res.json(await getBondById(req.params.id));
}
export async function sentBonds(req: Request, res: Response) {
  return res.json(await getBondsBySenderId(req.user!.id));
}
export async function receivedBonds(req: Request, res: Response) {
  return res.json(await getBondsReceivedByUser(req.user!.id));
}
export async function bondsAsCustomer(req: Request, res: Response) {
  return res.json(await getBondsAsCustomer(req.user!.id));
}
export async function bondsAsProfessional(req: Request, res: Response) {
  return res.json(await getBondsAsProfessional(req.user!.id));
}
export async function myBonds(req: Request, res: Response) {
  return res.json(await getBondsByUser(req.user!.id));
}
export async function activeStudents(req: Request, res: Response) {
  const { page = "1", pageSize = "10", search } = req.query as Record<string, string>;
  return res.json(await getActiveStudents(req.user!.id, parseInt(page), parseInt(pageSize), search));
}
export async function createBondHandler(req: Request, res: Response) {
  const { customerId, professionalId } = createBondSchema.parse(req.body);
  return res.status(201).json(await createBond({ customerId, professionalId, senderId: req.user!.id }));
}
export async function updateBondHandler(req: Request, res: Response) {
  const { status } = updateBondSchema.parse(req.body);
  return res.json(await updateBond(req.params.id, status));
}
export async function deleteBondHandler(req: Request, res: Response) {
  await deleteBond(req.params.id);
  return res.status(204).send();
}
`
);

// ─── Module: Exercises ─────────────────────────────────────────────────────────

writeFile(
  "src/modules/exercises/exercises.schemas.ts",
  `import { z } from "zod";

export const createExerciseSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  instruction: z.string().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  isPublished: z.boolean().optional().default(false),
  primaryMuscleIds: z.array(z.string().uuid()).optional(),
  secondaryMuscleIds: z.array(z.string().uuid()).optional(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const updateExerciseMediaSchema = z.object({
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
});
`
);

writeFile(
  "src/modules/exercises/exercises.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

const exerciseInclude = {
  category: true,
  primaryMuscles: { include: { muscle: { include: { muscleGroup: true } } } },
  secondaryMuscles: { include: { muscle: { include: { muscleGroup: true } } } },
} as const;

export async function listExercises(page: number, pageSize: number, userId?: string) {
  const where = {
    status: "A",
    OR: [{ isPublished: true }, ...(userId ? [{ createdByUserId: userId }] : [])],
  };
  const [total, data] = await Promise.all([
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({ where, include: exerciseInclude, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { total, page, pageSize, data };
}

export async function searchExercises(
  searchTerm: string,
  categoryId?: string,
  page = 1,
  pageSize = 20,
  userId?: string
) {
  const where = {
    status: "A",
    name: searchTerm ? { contains: searchTerm, mode: "insensitive" as const } : undefined,
    categoryId: categoryId || undefined,
    OR: [{ isPublished: true }, ...(userId ? [{ createdByUserId: userId }] : [])],
  };
  const [total, data] = await Promise.all([
    prisma.exercise.count({ where }),
    prisma.exercise.findMany({ where, include: exerciseInclude, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { total, page, pageSize, data };
}

export async function getExerciseById(id: string) {
  const ex = await prisma.exercise.findUnique({ where: { id }, include: exerciseInclude });
  if (!ex) throw new AppError("Exercise not found", 404);
  return ex;
}

export async function getCategories() {
  return prisma.exerciseCategory.findMany({ where: { status: "A" } });
}

export async function getMuscleGroups() {
  return prisma.muscleGroup.findMany({
    where: { status: "A" },
    include: { muscles: { where: { status: "A" } } },
  });
}

export async function getExercisesByMuscleGroup(muscleGroupId: string) {
  return prisma.exercise.findMany({
    where: {
      status: "A",
      OR: [
        { primaryMuscles: { some: { muscle: { muscleGroupId } } } },
        { secondaryMuscles: { some: { muscle: { muscleGroupId } } } },
      ],
    },
    include: exerciseInclude,
  });
}

export async function createExercise(
  userId: string,
  data: {
    categoryId: string;
    name: string;
    instruction?: string;
    imageUrl?: string;
    videoUrl?: string;
    isPublished?: boolean;
    primaryMuscleIds?: string[];
    secondaryMuscleIds?: string[];
  }
) {
  const { primaryMuscleIds = [], secondaryMuscleIds = [], ...rest } = data;
  return prisma.exercise.create({
    data: {
      ...rest,
      createdByUserId: userId,
      primaryMuscles: { create: primaryMuscleIds.map((id) => ({ muscleId: id })) },
      secondaryMuscles: { create: secondaryMuscleIds.map((id) => ({ muscleId: id })) },
    },
    include: exerciseInclude,
  });
}

export async function updateExercise(id: string, userId: string, data: Parameters<typeof createExercise>[1]) {
  const ex = await prisma.exercise.findUnique({ where: { id } });
  if (!ex || ex.createdByUserId !== userId) throw new AppError("Exercise not found or unauthorized", 403);

  const { primaryMuscleIds, secondaryMuscleIds, ...rest } = data;

  if (primaryMuscleIds !== undefined) {
    await prisma.exercisePrimaryMuscle.deleteMany({ where: { exerciseId: id } });
  }
  if (secondaryMuscleIds !== undefined) {
    await prisma.exerciseSecondaryMuscle.deleteMany({ where: { exerciseId: id } });
  }

  return prisma.exercise.update({
    where: { id },
    data: {
      ...rest,
      ...(primaryMuscleIds ? { primaryMuscles: { create: primaryMuscleIds.map((mid) => ({ muscleId: mid })) } } : {}),
      ...(secondaryMuscleIds ? { secondaryMuscles: { create: secondaryMuscleIds.map((mid) => ({ muscleId: mid })) } } : {}),
    },
    include: exerciseInclude,
  });
}

export async function updateExerciseMedia(id: string, data: { imageUrl?: string; videoUrl?: string }) {
  return prisma.exercise.update({ where: { id }, data, include: exerciseInclude });
}

export async function deleteExercise(id: string, userId: string) {
  const ex = await prisma.exercise.findUnique({ where: { id } });
  if (!ex || ex.createdByUserId !== userId) throw new AppError("Exercise not found or unauthorized", 403);
  await prisma.exercise.update({ where: { id }, data: { status: "I" } });
}

export async function getUserExercises(userId: string, page: number, pageSize: number) {
  const [total, data] = await Promise.all([
    prisma.exercise.count({ where: { createdByUserId: userId, status: "A" } }),
    prisma.exercise.findMany({
      where: { createdByUserId: userId, status: "A" },
      include: exerciseInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { total, page, pageSize, data };
}
`
);

writeFile(
  "src/modules/exercises/exercises.controller.ts",
  `import { Request, Response } from "express";
import {
  listExercises, searchExercises, getExerciseById, getCategories,
  getMuscleGroups, getExercisesByMuscleGroup, createExercise,
  updateExercise, updateExerciseMedia, deleteExercise, getUserExercises,
} from "./exercises.service";
import { createExerciseSchema, updateExerciseSchema, updateExerciseMediaSchema } from "./exercises.schemas";

export async function list(req: Request, res: Response) {
  const { page = "1", pageSize = "50" } = req.query as Record<string, string>;
  return res.json(await listExercises(parseInt(page), parseInt(pageSize), req.user?.id));
}
export async function search(req: Request, res: Response) {
  const { searchTerm = "", categoryId, page = "1", pageSize = "20" } = req.query as Record<string, string>;
  return res.json(await searchExercises(searchTerm, categoryId, parseInt(page), parseInt(pageSize), req.user?.id));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getExerciseById(req.params.exerciseId));
}
export async function listCategories(_req: Request, res: Response) {
  return res.json(await getCategories());
}
export async function listMuscleGroups(_req: Request, res: Response) {
  return res.json(await getMuscleGroups());
}
export async function byMuscleGroup(req: Request, res: Response) {
  return res.json(await getExercisesByMuscleGroup(req.params.muscleGroupId));
}
export async function create(req: Request, res: Response) {
  const data = createExerciseSchema.parse(req.body);
  return res.status(201).json(await createExercise(req.user!.id, data));
}
export async function update(req: Request, res: Response) {
  const data = updateExerciseSchema.parse(req.body);
  return res.json(await updateExercise(req.params.exerciseId, req.user!.id, data as Parameters<typeof createExercise>[1]));
}
export async function patchMedia(req: Request, res: Response) {
  const data = updateExerciseMediaSchema.parse(req.body);
  return res.json(await updateExerciseMedia(req.params.exerciseId, data));
}
export async function remove(req: Request, res: Response) {
  await deleteExercise(req.params.exerciseId, req.user!.id);
  return res.status(204).send();
}
export async function myExercises(req: Request, res: Response) {
  const { page = "1", pageSize = "50" } = req.query as Record<string, string>;
  return res.json(await getUserExercises(req.user!.id, parseInt(page), parseInt(pageSize)));
}
`
);

// ─── Module: Routines ──────────────────────────────────────────────────────────

writeFile(
  "src/modules/routines/routines.schemas.ts",
  `import { z } from "zod";

export const createRoutineSchema = z.object({
  title: z.string().min(1),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
  weeks: z.number().int().positive().optional(),
});

export const updateRoutineSchema = createRoutineSchema.partial();

export const assignRoutineSchema = z.object({
  routineId: z.string().uuid(),
  customerId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(),
});

export const updateExpirySchema = z.object({
  expiresAt: z.string().datetime().nullable(),
});
`
);

writeFile(
  "src/modules/routines/routines.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

const routineInclude = {
  workoutTemplates: { where: { status: "A" }, include: { exerciseTemplates: { include: { exercise: true } } } },
  customerRoutines: { include: { customer: { select: { id: true, name: true, email: true } } } },
} as const;

export async function createRoutine(personalId: string, data: { title: string; goal?: string; difficulty?: string; weeks?: number }) {
  return prisma.routine.create({ data: { ...data, personalId }, include: routineInclude });
}

export async function updateRoutine(routineId: string, personalId: string, data: Partial<{ title: string; goal: string; difficulty: string; weeks: number }>) {
  const r = await prisma.routine.findFirst({ where: { id: routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  return prisma.routine.update({ where: { id: routineId }, data, include: routineInclude });
}

export async function deleteRoutine(routineId: string, personalId: string) {
  const r = await prisma.routine.findFirst({ where: { id: routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  await prisma.routine.update({ where: { id: routineId }, data: { status: "I" } });
}

export async function getRoutineById(routineId: string) {
  const r = await prisma.routine.findUnique({ where: { id: routineId }, include: routineInclude });
  if (!r) throw new AppError("Routine not found", 404);
  return r;
}

export async function getRoutinesByPersonal(personalId: string, page: number, pageSize: number) {
  const [total, data] = await Promise.all([
    prisma.routine.count({ where: { personalId, status: "A" } }),
    prisma.routine.findMany({ where: { personalId, status: "A" }, include: routineInclude, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { total, page, pageSize, data };
}

export async function assignRoutineToCustomer(personalId: string, data: { routineId: string; customerId: string; expiresAt?: string }) {
  const r = await prisma.routine.findFirst({ where: { id: data.routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  return prisma.customerRoutine.create({
    data: {
      routineId: data.routineId,
      customerId: data.customerId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
    include: { routine: true, customer: { select: { id: true, name: true, email: true } } },
  });
}

export async function unassignRoutineFromCustomer(routineId: string, customerId: string, personalId: string) {
  const r = await prisma.routine.findFirst({ where: { id: routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  await prisma.customerRoutine.delete({ where: { routineId_customerId: { routineId, customerId } } });
}

export async function getCustomerRoutines(customerId: string, page: number, pageSize: number) {
  const [total, data] = await Promise.all([
    prisma.customerRoutine.count({ where: { customerId, status: "A" } }),
    prisma.customerRoutine.findMany({
      where: { customerId, status: "A" },
      include: { routine: { include: routineInclude } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { total, page, pageSize, data };
}

export async function getRoutineCustomers(routineId: string, personalId: string) {
  const r = await prisma.routine.findFirst({ where: { id: routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  const assigned = await prisma.customerRoutine.findMany({
    where: { routineId },
    include: { customer: { select: { id: true, name: true, email: true } } },
  });
  return { assigned };
}

export async function getRoutinesNearExpiry(personalId: string, daysThreshold: number) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  const routineIds = await prisma.routine.findMany({ where: { personalId, status: "A" }, select: { id: true } });
  return prisma.customerRoutine.findMany({
    where: {
      routineId: { in: routineIds.map((r) => r.id) },
      status: "A",
      expiresAt: { lte: threshold, gte: new Date() },
    },
    include: { routine: true, customer: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateCustomerRoutineExpiry(routineId: string, customerId: string, personalId: string, expiresAt: string | null) {
  const r = await prisma.routine.findFirst({ where: { id: routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  return prisma.customerRoutine.update({
    where: { routineId_customerId: { routineId, customerId } },
    data: { expiresAt: expiresAt ? new Date(expiresAt) : null },
  });
}
`
);

writeFile(
  "src/modules/routines/routines.controller.ts",
  `import { Request, Response } from "express";
import {
  createRoutine, updateRoutine, deleteRoutine, getRoutineById,
  getRoutinesByPersonal, assignRoutineToCustomer, unassignRoutineFromCustomer,
  getCustomerRoutines, getRoutineCustomers, getRoutinesNearExpiry, updateCustomerRoutineExpiry,
} from "./routines.service";
import { createRoutineSchema, updateRoutineSchema, assignRoutineSchema, updateExpirySchema } from "./routines.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createRoutine(req.user!.id, createRoutineSchema.parse(req.body)));
}
export async function update(req: Request, res: Response) {
  return res.json(await updateRoutine(req.params.routineId, req.user!.id, updateRoutineSchema.parse(req.body)));
}
export async function remove(req: Request, res: Response) {
  await deleteRoutine(req.params.routineId, req.user!.id);
  return res.status(204).send();
}
export async function getById(req: Request, res: Response) {
  return res.json(await getRoutineById(req.params.routineId));
}
export async function myRoutines(req: Request, res: Response) {
  const { page = "1", pageSize = "10" } = req.query as Record<string, string>;
  return res.json(await getRoutinesByPersonal(req.user!.id, parseInt(page), parseInt(pageSize)));
}
export async function assign(req: Request, res: Response) {
  return res.status(201).json(await assignRoutineToCustomer(req.user!.id, assignRoutineSchema.parse(req.body)));
}
export async function unassign(req: Request, res: Response) {
  await unassignRoutineFromCustomer(req.params.routineId, req.params.customerId, req.user!.id);
  return res.status(204).send();
}
export async function myAssignedRoutines(req: Request, res: Response) {
  const { page = "1", pageSize = "10" } = req.query as Record<string, string>;
  return res.json(await getCustomerRoutines(req.user!.id, parseInt(page), parseInt(pageSize)));
}
export async function customerRoutinesHandler(req: Request, res: Response) {
  const { page = "1", pageSize = "10" } = req.query as Record<string, string>;
  return res.json(await getCustomerRoutines(req.params.customerId, parseInt(page), parseInt(pageSize)));
}
export async function routineCustomers(req: Request, res: Response) {
  return res.json(await getRoutineCustomers(req.params.routineId, req.user!.id));
}
export async function nearExpiry(req: Request, res: Response) {
  const { daysThreshold = "7" } = req.query as Record<string, string>;
  return res.json(await getRoutinesNearExpiry(req.user!.id, parseInt(daysThreshold)));
}
export async function updateExpiry(req: Request, res: Response) {
  const { expiresAt } = updateExpirySchema.parse(req.body);
  return res.json(await updateCustomerRoutineExpiry(req.params.routineId, req.params.customerId, req.user!.id, expiresAt ?? null));
}
`
);

// ─── Module: Professional Workout Templates ────────────────────────────────────

writeFile(
  "src/modules/pro-workout-templates/pro-workout-templates.schemas.ts",
  `import { z } from "zod";

export const createTemplateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const addExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  order: z.number().int().nonnegative().optional().default(0),
  targetSets: z.number().int().positive(),
  targetRepsMin: z.number().int().positive().optional(),
  targetRepsMax: z.number().int().positive().optional(),
  suggestedLoad: z.number().positive().optional(),
  restSeconds: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const updateExerciseTemplateSchema = addExerciseSchema.partial();

export const reorderSchema = z.array(z.string().uuid());
`
);

writeFile(
  "src/modules/pro-workout-templates/pro-workout-templates.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

const templateInclude = {
  exerciseTemplates: {
    where: { status: "A" },
    orderBy: { order: "asc" as const },
    include: { exercise: true },
  },
} as const;

async function assertPersonalOwnsRoutine(routineId: string, personalId: string) {
  const r = await prisma.routine.findFirst({ where: { id: routineId, personalId } });
  if (!r) throw new AppError("Routine not found or unauthorized", 403);
  return r;
}

async function assertPersonalOwnsTemplate(templateId: string, personalId: string) {
  const t = await prisma.workoutTemplate.findFirst({
    where: { id: templateId, routine: { personalId } },
  });
  if (!t) throw new AppError("Template not found or unauthorized", 403);
  return t;
}

export async function createTemplate(
  routineId: string,
  personalId: string,
  data: { title: string; description?: string; estimatedDurationMinutes?: number; order?: number }
) {
  await assertPersonalOwnsRoutine(routineId, personalId);
  return prisma.workoutTemplate.create({ data: { ...data, routineId }, include: templateInclude });
}

export async function getTemplateById(templateId: string) {
  const t = await prisma.workoutTemplate.findUnique({ where: { id: templateId }, include: templateInclude });
  if (!t) throw new AppError("Template not found", 404);
  return t;
}

export async function getTemplatesByRoutine(routineId: string) {
  return prisma.workoutTemplate.findMany({
    where: { routineId, status: "A" },
    include: templateInclude,
    orderBy: { order: "asc" },
  });
}

export async function updateTemplate(
  templateId: string,
  personalId: string,
  data: Partial<{ title: string; description: string; estimatedDurationMinutes: number; order: number }>
) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  return prisma.workoutTemplate.update({ where: { id: templateId }, data, include: templateInclude });
}

export async function deleteTemplate(templateId: string, personalId: string) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  await prisma.workoutTemplate.update({ where: { id: templateId }, data: { status: "I" } });
}

export async function addExerciseToTemplate(
  templateId: string,
  personalId: string,
  data: { exerciseId: string; order?: number; targetSets: number; targetRepsMin?: number; targetRepsMax?: number; suggestedLoad?: number; restSeconds?: number; notes?: string }
) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  return prisma.exerciseTemplate.create({
    data: { workoutTemplateId: templateId, ...data },
    include: { exercise: true },
  });
}

export async function updateExerciseTemplate(exerciseTemplateId: string, personalId: string, data: Partial<Parameters<typeof addExerciseToTemplate>[2]>) {
  const et = await prisma.exerciseTemplate.findFirst({
    where: { id: exerciseTemplateId, workoutTemplate: { routine: { personalId } } },
  });
  if (!et) throw new AppError("ExerciseTemplate not found or unauthorized", 403);
  return prisma.exerciseTemplate.update({ where: { id: exerciseTemplateId }, data, include: { exercise: true } });
}

export async function removeExerciseFromTemplate(exerciseTemplateId: string, personalId: string) {
  const et = await prisma.exerciseTemplate.findFirst({
    where: { id: exerciseTemplateId, workoutTemplate: { routine: { personalId } } },
  });
  if (!et) throw new AppError("ExerciseTemplate not found or unauthorized", 403);
  await prisma.exerciseTemplate.update({ where: { id: exerciseTemplateId }, data: { status: "I" } });
}

export async function reorderExercises(templateId: string, personalId: string, orderedIds: string[]) {
  await assertPersonalOwnsTemplate(templateId, personalId);
  await Promise.all(
    orderedIds.map((id, idx) => prisma.exerciseTemplate.update({ where: { id }, data: { order: idx } }))
  );
  return getTemplateById(templateId);
}
`
);

writeFile(
  "src/modules/pro-workout-templates/pro-workout-templates.controller.ts",
  `import { Request, Response } from "express";
import {
  createTemplate, getTemplateById, getTemplatesByRoutine, updateTemplate,
  deleteTemplate, addExerciseToTemplate, updateExerciseTemplate,
  removeExerciseFromTemplate, reorderExercises,
} from "./pro-workout-templates.service";
import {
  createTemplateSchema, updateTemplateSchema, addExerciseSchema,
  updateExerciseTemplateSchema, reorderSchema,
} from "./pro-workout-templates.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createTemplate(req.params.routineId, req.user!.id, createTemplateSchema.parse(req.body)));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getTemplateById(req.params.templateId));
}
export async function byRoutine(req: Request, res: Response) {
  return res.json(await getTemplatesByRoutine(req.params.routineId));
}
export async function update(req: Request, res: Response) {
  return res.json(await updateTemplate(req.params.templateId, req.user!.id, updateTemplateSchema.parse(req.body)));
}
export async function remove(req: Request, res: Response) {
  await deleteTemplate(req.params.templateId, req.user!.id);
  return res.status(204).send();
}
export async function addExercise(req: Request, res: Response) {
  return res.status(201).json(await addExerciseToTemplate(req.params.templateId, req.user!.id, addExerciseSchema.parse(req.body)));
}
export async function updateExercise(req: Request, res: Response) {
  return res.json(await updateExerciseTemplate(req.params.exerciseTemplateId, req.user!.id, updateExerciseTemplateSchema.parse(req.body) as Parameters<typeof addExerciseToTemplate>[2]));
}
export async function removeExercise(req: Request, res: Response) {
  await removeExerciseFromTemplate(req.params.exerciseTemplateId, req.user!.id);
  return res.status(204).send();
}
export async function reorder(req: Request, res: Response) {
  return res.json(await reorderExercises(req.params.templateId, req.user!.id, reorderSchema.parse(req.body)));
}
`
);

// ─── Module: Professional Workout Sessions ─────────────────────────────────────

writeFile(
  "src/modules/pro-workout-sessions/pro-workout-sessions.schemas.ts",
  `import { z } from "zod";

export const startSessionSchema = z.object({
  workoutTemplateId: z.string().uuid(),
  routineId: z.string().uuid(),
  notes: z.string().optional(),
});

export const finishSessionSchema = z.object({
  notes: z.string().optional(),
  difficultyRating: z.number().int().min(1).max(5).optional(),
  energyRating: z.number().int().min(1).max(5).optional(),
  exercises: z.array(z.object({
    exerciseTemplateId: z.string().uuid(),
    sets: z.array(z.object({
      setNumber: z.number().int().positive(),
      load: z.number().nonnegative().optional(),
      reps: z.number().int().nonnegative().optional(),
      restSeconds: z.number().int().nonnegative().optional(),
      completed: z.boolean().optional().default(true),
      notes: z.string().optional(),
    })),
  })).optional(),
});
`
);

writeFile(
  "src/modules/pro-workout-sessions/pro-workout-sessions.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

const sessionInclude = {
  workoutTemplate: { include: { exerciseTemplates: { include: { exercise: true } } } },
  routine: true,
  exerciseSessions: {
    include: {
      exerciseTemplate: { include: { exercise: true } },
      setSessions: true,
    },
  },
} as const;

export async function startProSession(
  customerId: string,
  data: { workoutTemplateId: string; routineId: string; notes?: string }
) {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id: data.workoutTemplateId },
    include: { exerciseTemplates: { where: { status: "A" }, orderBy: { order: "asc" }, include: { exercise: true } } },
  });
  if (!template) throw new AppError("Workout template not found", 404);

  return prisma.workoutSession.create({
    data: {
      customerId,
      workoutTemplateId: data.workoutTemplateId,
      routineId: data.routineId,
      titleSnapshot: template.title,
      status: "IP",
      notes: data.notes,
      exerciseSessions: {
        create: template.exerciseTemplates.map((et, i) => ({
          exerciseTemplateId: et.id,
          exerciseId: et.exerciseId,
          order: i,
          plannedSets: et.targetSets,
          plannedReps: et.targetRepsMin ?? et.targetRepsMax,
          status: "NS",
        })),
      },
    },
    include: sessionInclude,
  });
}

export async function listProSessions(customerId: string) {
  return prisma.workoutSession.findMany({
    where: { customerId },
    include: sessionInclude,
    orderBy: { startedAt: "desc" },
  });
}

export async function getProSessionById(customerId: string, sessionId: string) {
  const s = await prisma.workoutSession.findFirst({ where: { id: sessionId, customerId }, include: sessionInclude });
  if (!s) throw new AppError("Session not found", 404);
  return s;
}

export async function finishProSession(
  customerId: string,
  sessionId: string,
  data: {
    notes?: string;
    difficultyRating?: number;
    energyRating?: number;
    exercises?: Array<{ exerciseTemplateId: string; sets: Array<{ setNumber: number; load?: number; reps?: number; restSeconds?: number; completed?: boolean; notes?: string }> }>;
  }
) {
  const session = await getProSessionById(customerId, sessionId);
  if (session.status === "C") throw new AppError("Session already finished", 409);

  if (data.exercises) {
    for (const ex of data.exercises) {
      const es = await prisma.exerciseSession.findFirst({
        where: { workoutSessionId: sessionId, exerciseTemplateId: ex.exerciseTemplateId },
      });
      if (!es) continue;
      await prisma.exerciseSession.update({ where: { id: es.id }, data: { status: "C", completedAt: new Date() } });
      for (const set of ex.sets) {
        await prisma.setSession.create({
          data: { exerciseSessionId: es.id, ...set },
        });
      }
    }
  }

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: "C",
      completedAt: new Date(),
      notes: data.notes,
      difficultyRating: data.difficultyRating,
      energyRating: data.energyRating,
    },
    include: sessionInclude,
  });
}
`
);

writeFile(
  "src/modules/pro-workout-sessions/pro-workout-sessions.controller.ts",
  `import { Request, Response } from "express";
import { startProSession, listProSessions, getProSessionById, finishProSession } from "./pro-workout-sessions.service";
import { startSessionSchema, finishSessionSchema } from "./pro-workout-sessions.schemas";

export async function start(req: Request, res: Response) {
  return res.status(201).json(await startProSession(req.user!.id, startSessionSchema.parse(req.body)));
}
export async function list(req: Request, res: Response) {
  return res.json(await listProSessions(req.user!.id));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getProSessionById(req.user!.id, req.params.sessionId));
}
export async function finish(req: Request, res: Response) {
  return res.json(await finishProSession(req.user!.id, req.params.sessionId, finishSessionSchema.parse(req.body)));
}
`
);

// ─── Module: Favorites ─────────────────────────────────────────────────────────

writeFile(
  "src/modules/favorites/favorites.schemas.ts",
  `import { z } from "zod";
export const addFavoriteSchema = z.object({ professionalId: z.string().uuid() });
`
);

writeFile(
  "src/modules/favorites/favorites.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

export async function addFavorite(customerId: string, professionalId: string) {
  return prisma.favoriteProfessional.create({
    data: { customerId, professionalId },
    include: { professional: { select: { id: true, name: true, email: true, imageUrl: true } } },
  });
}

export async function removeFavorite(customerId: string, professionalId: string) {
  const fav = await prisma.favoriteProfessional.findUnique({
    where: { customerId_professionalId: { customerId, professionalId } },
  });
  if (!fav) throw new AppError("Favorite not found", 404);
  await prisma.favoriteProfessional.delete({ where: { customerId_professionalId: { customerId, professionalId } } });
}

export async function listFavorites(customerId: string) {
  return prisma.favoriteProfessional.findMany({
    where: { customerId },
    include: { professional: { select: { id: true, name: true, email: true, imageUrl: true, professionalCredential: true } } },
  });
}
`
);

writeFile(
  "src/modules/favorites/favorites.controller.ts",
  `import { Request, Response } from "express";
import { addFavorite, removeFavorite, listFavorites } from "./favorites.service";
import { addFavoriteSchema } from "./favorites.schemas";

export async function add(req: Request, res: Response) {
  const { professionalId } = addFavoriteSchema.parse(req.body);
  return res.status(201).json(await addFavorite(req.user!.id, professionalId));
}
export async function remove(req: Request, res: Response) {
  await removeFavorite(req.user!.id, req.params.professionalId);
  return res.status(204).send();
}
export async function list(req: Request, res: Response) {
  return res.json(await listFavorites(req.user!.id));
}
`
);

// ─── Module: Feedback ──────────────────────────────────────────────────────────

writeFile(
  "src/modules/feedback/feedback.schemas.ts",
  `import { z } from "zod";
export const createFeedbackSchema = z.object({
  professionalId: z.string().uuid(),
  testimony: z.string().optional(),
  rate: z.number().int().min(1).max(5),
  type: z.number().int().optional().default(0),
});
`
);

writeFile(
  "src/modules/feedback/feedback.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

export async function createFeedback(customerId: string, data: { professionalId: string; testimony?: string; rate: number; type?: number }) {
  return prisma.customerFeedback.create({
    data: { customerId, ...data },
    include: { customer: { select: { id: true, name: true } }, professional: { select: { id: true, name: true } } },
  });
}

export async function listFeedbacksByProfessional(professionalId: string) {
  return prisma.customerFeedback.findMany({
    where: { professionalId, status: "A" },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbackById(id: string) {
  const f = await prisma.customerFeedback.findUnique({
    where: { id },
    include: { customer: { select: { id: true, name: true } }, professional: { select: { id: true, name: true } } },
  });
  if (!f) throw new AppError("Feedback not found", 404);
  return f;
}
`
);

writeFile(
  "src/modules/feedback/feedback.controller.ts",
  `import { Request, Response } from "express";
import { createFeedback, listFeedbacksByProfessional, getFeedbackById } from "./feedback.service";
import { createFeedbackSchema } from "./feedback.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createFeedback(req.user!.id, createFeedbackSchema.parse(req.body)));
}
export async function listByProfessional(req: Request, res: Response) {
  const { professionalId } = req.query as { professionalId: string };
  return res.json(await listFeedbacksByProfessional(professionalId));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getFeedbackById(req.params.id));
}
`
);

// ─── Module: Appointments ──────────────────────────────────────────────────────

writeFile(
  "src/modules/appointments/appointments.schemas.ts",
  `import { z } from "zod";
export const createAppointmentSchema = z.object({
  customerProfessionalBondId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  type: z.enum(["PR", "ON"]).optional().default("PR"),
  addressId: z.string().uuid().optional(),
});
export const updateAppointmentSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  type: z.enum(["PR", "ON"]).optional(),
  status: z.enum(["P", "A", "R", "C"]).optional(),
  addressId: z.string().uuid().optional(),
});
`
);

writeFile(
  "src/modules/appointments/appointments.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

const apptInclude = {
  bond: { include: { customer: { select: { id: true, name: true } }, professional: { select: { id: true, name: true } } } },
  address: true,
} as const;

export async function createAppointment(data: { customerProfessionalBondId: string; scheduledAt: string; type: string; addressId?: string }) {
  return prisma.appointment.create({
    data: { ...data, scheduledAt: new Date(data.scheduledAt) },
    include: apptInclude,
  });
}

export async function listAppointments(userId: string) {
  return prisma.appointment.findMany({
    where: { bond: { OR: [{ customerId: userId }, { professionalId: userId }] } },
    include: apptInclude,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function updateAppointment(id: string, data: { scheduledAt?: string; type?: string; status?: string; addressId?: string }) {
  const { scheduledAt, ...rest } = data;
  return prisma.appointment.update({
    where: { id },
    data: { ...rest, ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}) },
    include: apptInclude,
  });
}

export async function deleteAppointment(id: string) {
  const a = await prisma.appointment.findUnique({ where: { id } });
  if (!a) throw new AppError("Appointment not found", 404);
  await prisma.appointment.delete({ where: { id } });
}
`
);

writeFile(
  "src/modules/appointments/appointments.controller.ts",
  `import { Request, Response } from "express";
import { createAppointment, listAppointments, updateAppointment, deleteAppointment } from "./appointments.service";
import { createAppointmentSchema, updateAppointmentSchema } from "./appointments.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createAppointment(createAppointmentSchema.parse(req.body)));
}
export async function list(req: Request, res: Response) {
  return res.json(await listAppointments(req.user!.id));
}
export async function update(req: Request, res: Response) {
  return res.json(await updateAppointment(req.params.id, updateAppointmentSchema.parse(req.body)));
}
export async function remove(req: Request, res: Response) {
  await deleteAppointment(req.params.id);
  return res.status(204).send();
}
`
);

// ─── Module: Push Notifications ────────────────────────────────────────────────

writeFile(
  "src/modules/push/push.schemas.ts",
  `import { z } from "zod";
export const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
  expirationTime: z.string().datetime().optional(),
  userAgent: z.string().optional(),
});
`
);

writeFile(
  "src/modules/push/push.service.ts",
  `import { prisma } from "../../lib/prisma";
import { AppError } from "../../common/app-error";

export async function subscribe(
  userId: string,
  data: { endpoint: string; p256dh: string; auth: string; expirationTime?: string; userAgent?: string }
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    update: { isActive: true, p256dh: data.p256dh, auth: data.auth },
    create: {
      userId,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      expirationTime: data.expirationTime ? new Date(data.expirationTime) : undefined,
      userAgent: data.userAgent,
    },
  });
}

export async function unsubscribe(userId: string, endpoint: string) {
  const sub = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  if (!sub || sub.userId !== userId) throw new AppError("Subscription not found", 404);
  await prisma.pushSubscription.update({ where: { endpoint }, data: { isActive: false } });
}

export async function getActiveSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({ where: { userId, isActive: true } });
}
`
);

writeFile(
  "src/modules/push/push.controller.ts",
  `import { Request, Response } from "express";
import { subscribe, unsubscribe } from "./push.service";
import { subscribeSchema } from "./push.schemas";

export async function subscribeHandler(req: Request, res: Response) {
  return res.status(201).json(await subscribe(req.user!.id, subscribeSchema.parse(req.body)));
}
export async function unsubscribeHandler(req: Request, res: Response) {
  const { endpoint } = req.body as { endpoint: string };
  await unsubscribe(req.user!.id, endpoint);
  return res.status(204).send();
}
`
);

// ─── Updated app.ts ────────────────────────────────────────────────────────────

writeFile(
  "src/app.ts",
  `import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { errorHandler } from "./common/error-handler";
import { loginSelfManaged, registerSelfManaged, sendMagicLinkHandler, validateMagicLinkHandler } from "./modules/auth/auth.controller";
import { ensureAuthenticated } from "./modules/auth/auth.middleware";
import { getHealth } from "./modules/health/health.controller";

// Self-managed
import {
  createMyWorkoutTemplate, deleteMyWorkoutTemplate, finishMyWorkoutSession,
  getMyWeeklyGoal, getMyWeeklyProgress, getMyProfile, getMyWorkoutSession,
  getMyWorkoutTemplate, listMyWorkoutSessions, listMyWorkoutTemplates,
  startMyWorkoutSession, upsertMyWeeklyGoal, updateMyProfile, updateMyWorkoutTemplate,
} from "./modules/self-managed/self-managed.controller";

// Users
import { listUsers, getUser, updateUserHandler, deleteUserHandler, getUserFeedbacks } from "./modules/users/users.controller";

// Bonds
import {
  listBonds, getBond, sentBonds, receivedBonds, bondsAsCustomer,
  bondsAsProfessional, myBonds, activeStudents, createBondHandler,
  updateBondHandler, deleteBondHandler,
} from "./modules/bonds/bonds.controller";

// Exercises
import {
  list as listExercises, search as searchExercises, getById as getExercise,
  listCategories, listMuscleGroups, byMuscleGroup, create as createExercise,
  update as updateExercise, patchMedia, remove as removeExercise, myExercises,
} from "./modules/exercises/exercises.controller";

// Routines
import {
  create as createRoutine, update as updateRoutine, remove as removeRoutine,
  getById as getRoutine, myRoutines, assign, unassign, myAssignedRoutines,
  customerRoutinesHandler, routineCustomers, nearExpiry, updateExpiry,
} from "./modules/routines/routines.controller";

// Pro Workout Templates
import {
  create as createProTemplate, getById as getProTemplate, byRoutine,
  update as updateProTemplate, remove as removeProTemplate, addExercise,
  updateExercise as updateExerciseTemplate, removeExercise, reorder,
} from "./modules/pro-workout-templates/pro-workout-templates.controller";

// Pro Workout Sessions
import {
  start as startProSession, list as listProSessions, getById as getProSession, finish as finishProSession,
} from "./modules/pro-workout-sessions/pro-workout-sessions.controller";

// Favorites
import { add as addFavorite, remove as removeFavorite, list as listFavorites } from "./modules/favorites/favorites.controller";

// Feedback
import { create as createFeedback, listByProfessional, getById as getFeedback } from "./modules/feedback/feedback.controller";

// Appointments
import { create as createAppointment, list as listAppointments, update as updateAppointment, remove as removeAppointment } from "./modules/appointments/appointments.controller";

// Push
import { subscribeHandler, unsubscribeHandler } from "./modules/push/push.controller";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp());

  // Health
  app.get("/health", getHealth);

  // Auth
  app.post("/auth/self-managed/register", registerSelfManaged);
  app.post("/auth/self-managed/login", loginSelfManaged);
  app.post("/auth/magic-link/send", sendMagicLinkHandler);
  app.post("/auth/magic-link/validate", validateMagicLinkHandler);

  // Self-managed user routes
  app.get("/users/me", ensureAuthenticated, getMyProfile);
  app.put("/users/me", ensureAuthenticated, updateMyProfile);
  app.get("/workouts/templates", ensureAuthenticated, listMyWorkoutTemplates);
  app.post("/workouts/templates", ensureAuthenticated, createMyWorkoutTemplate);
  app.get("/workouts/templates/:workoutId", ensureAuthenticated, getMyWorkoutTemplate);
  app.put("/workouts/templates/:workoutId", ensureAuthenticated, updateMyWorkoutTemplate);
  app.delete("/workouts/templates/:workoutId", ensureAuthenticated, deleteMyWorkoutTemplate);
  app.get("/workouts/sessions", ensureAuthenticated, listMyWorkoutSessions);
  app.post("/workouts/sessions", ensureAuthenticated, startMyWorkoutSession);
  app.get("/workouts/sessions/:sessionId", ensureAuthenticated, getMyWorkoutSession);
  app.post("/workouts/sessions/:sessionId/finish", ensureAuthenticated, finishMyWorkoutSession);
  app.get("/goals/weekly", ensureAuthenticated, getMyWeeklyGoal);
  app.put("/goals/weekly", ensureAuthenticated, upsertMyWeeklyGoal);
  app.get("/goals/weekly/progress", ensureAuthenticated, getMyWeeklyProgress);

  // Users
  app.get("/users", ensureAuthenticated, listUsers);
  app.get("/users/:id/feedbacks", ensureAuthenticated, getUserFeedbacks);
  app.get("/users/:id", ensureAuthenticated, getUser);
  app.put("/users/:id", ensureAuthenticated, updateUserHandler);
  app.delete("/users/:id", ensureAuthenticated, deleteUserHandler);

  // Bonds
  app.get("/bonds", ensureAuthenticated, listBonds);
  app.get("/bonds/sent", ensureAuthenticated, sentBonds);
  app.get("/bonds/received", ensureAuthenticated, receivedBonds);
  app.get("/bonds/as-customer", ensureAuthenticated, bondsAsCustomer);
  app.get("/bonds/as-professional", ensureAuthenticated, bondsAsProfessional);
  app.get("/bonds/my-bonds", ensureAuthenticated, myBonds);
  app.get("/bonds/active-students", ensureAuthenticated, activeStudents);
  app.get("/bonds/:id", ensureAuthenticated, getBond);
  app.post("/bonds", ensureAuthenticated, createBondHandler);
  app.put("/bonds/:id", ensureAuthenticated, updateBondHandler);
  app.delete("/bonds/:id", ensureAuthenticated, deleteBondHandler);

  // Exercises
  app.get("/exercises/categories", ensureAuthenticated, listCategories);
  app.get("/exercises/muscle-groups", ensureAuthenticated, listMuscleGroups);
  app.get("/exercises/muscle-groups/:muscleGroupId/exercises", ensureAuthenticated, byMuscleGroup);
  app.get("/exercises/search", ensureAuthenticated, searchExercises);
  app.get("/exercises/my-exercises", ensureAuthenticated, myExercises);
  app.get("/exercises/:exerciseId", ensureAuthenticated, getExercise);
  app.get("/exercises", ensureAuthenticated, listExercises);
  app.post("/exercises", ensureAuthenticated, createExercise);
  app.put("/exercises/:exerciseId", ensureAuthenticated, updateExercise);
  app.patch("/exercises/:exerciseId/media", ensureAuthenticated, patchMedia);
  app.delete("/exercises/:exerciseId", ensureAuthenticated, removeExercise);

  // Routines
  app.get("/routines/near-expiry", ensureAuthenticated, nearExpiry);
  app.get("/routines/my-routines", ensureAuthenticated, myRoutines);
  app.get("/routines/my-assigned-routines", ensureAuthenticated, myAssignedRoutines);
  app.get("/routines/customer/:customerId", ensureAuthenticated, customerRoutinesHandler);
  app.get("/routines/:routineId/customers", ensureAuthenticated, routineCustomers);
  app.put("/routines/:routineId/customer/:customerId/expiry", ensureAuthenticated, updateExpiry);
  app.delete("/routines/:routineId/customer/:customerId", ensureAuthenticated, unassign);
  app.post("/routines/assign", ensureAuthenticated, assign);
  app.get("/routines/:routineId", ensureAuthenticated, getRoutine);
  app.post("/routines", ensureAuthenticated, createRoutine);
  app.put("/routines/:routineId", ensureAuthenticated, updateRoutine);
  app.delete("/routines/:routineId", ensureAuthenticated, removeRoutine);

  // Pro Workout Templates
  app.post("/workout-templates/routine/:routineId", ensureAuthenticated, createProTemplate);
  app.get("/workout-templates/routine/:routineId", ensureAuthenticated, byRoutine);
  app.get("/workout-templates/:templateId", ensureAuthenticated, getProTemplate);
  app.put("/workout-templates/:templateId", ensureAuthenticated, updateProTemplate);
  app.delete("/workout-templates/:templateId", ensureAuthenticated, removeProTemplate);
  app.post("/workout-templates/:templateId/exercises", ensureAuthenticated, addExercise);
  app.put("/workout-templates/exercise/:exerciseTemplateId", ensureAuthenticated, updateExerciseTemplate);
  app.delete("/workout-templates/exercise/:exerciseTemplateId", ensureAuthenticated, removeExercise);
  app.put("/workout-templates/:templateId/reorder", ensureAuthenticated, reorder);

  // Pro Workout Sessions
  app.post("/pro-sessions", ensureAuthenticated, startProSession);
  app.get("/pro-sessions", ensureAuthenticated, listProSessions);
  app.get("/pro-sessions/:sessionId", ensureAuthenticated, getProSession);
  app.post("/pro-sessions/:sessionId/finish", ensureAuthenticated, finishProSession);

  // Favorites
  app.post("/favorites", ensureAuthenticated, addFavorite);
  app.delete("/favorites/:professionalId", ensureAuthenticated, removeFavorite);
  app.get("/favorites", ensureAuthenticated, listFavorites);

  // Feedback
  app.post("/feedbacks", ensureAuthenticated, createFeedback);
  app.get("/feedbacks", ensureAuthenticated, listByProfessional);
  app.get("/feedbacks/:id", ensureAuthenticated, getFeedback);

  // Appointments
  app.post("/appointments", ensureAuthenticated, createAppointment);
  app.get("/appointments", ensureAuthenticated, listAppointments);
  app.put("/appointments/:id", ensureAuthenticated, updateAppointment);
  app.delete("/appointments/:id", ensureAuthenticated, removeAppointment);

  // Push
  app.post("/push/subscribe", ensureAuthenticated, subscribeHandler);
  app.delete("/push/unsubscribe", ensureAuthenticated, unsubscribeHandler);

  app.use(errorHandler);

  return app;
}
`
);

// ─── Integration tests ──────────────────────────────────────────────────────────

writeFile(
  "tests/integration/bonds.flow.spec.ts",
  `import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";
import { prisma } from "../../src/lib/prisma";

describe("Bonds flow", () => {
  const app = createApp();

  beforeEach(async () => {
    await resetSelfManagedStore();
    await prisma.customerProfessionalBond.deleteMany();
    await prisma.user.deleteMany({ where: { email: { in: ["personal@test.com", "customer@test.com"] } } });
  });

  it("personal creates bond with customer", async () => {
    // Register two self-managed users to simulate personal + customer
    const personalRes = await request(app).post("/auth/self-managed/register").send({
      name: "Personal", email: "personal@test.com", password: "12345678",
    });
    const customerRes = await request(app).post("/auth/self-managed/register").send({
      name: "Customer", email: "customer@test.com", password: "12345678",
    });

    const personalToken = personalRes.body.token;
    const customerId = customerRes.body.user.id;

    const bondRes = await request(app)
      .post("/bonds")
      .set("Authorization", \`Bearer \${personalToken}\`)
      .send({ customerId, professionalId: personalRes.body.user.id });

    expect(bondRes.status).toBe(201);
    expect(bondRes.body.customerId).toBe(customerId);

    const myBondsRes = await request(app)
      .get("/bonds/sent")
      .set("Authorization", \`Bearer \${personalToken}\`);

    expect(myBondsRes.status).toBe(200);
    expect(myBondsRes.body).toHaveLength(1);
  });
});
`
);

writeFile(
  "tests/integration/exercises.flow.spec.ts",
  `import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";
import { resetSelfManagedStore } from "../../src/modules/self-managed/self-managed.store";
import { prisma } from "../../src/lib/prisma";

describe("Exercises flow", () => {
  const app = createApp();
  let token: string;

  beforeEach(async () => {
    await resetSelfManagedStore();
    await prisma.exercise.deleteMany({ where: { createdByUser: { email: "user@exercises.test" } } });
    await prisma.user.deleteMany({ where: { email: "user@exercises.test" } });

    const reg = await request(app).post("/auth/self-managed/register").send({
      name: "Exercise User", email: "user@exercises.test", password: "12345678",
    });
    token = reg.body.token;

    // Seed category
    await prisma.exerciseCategory.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: { id: "00000000-0000-0000-0000-000000000001", name: "TestCategory" },
    });
  });

  it("creates, searches, updates and deletes a custom exercise", async () => {
    const createRes = await request(app)
      .post("/exercises")
      .set("Authorization", \`Bearer \${token}\`)
      .send({ categoryId: "00000000-0000-0000-0000-000000000001", name: "Test Push Up" });

    expect(createRes.status).toBe(201);
    const exerciseId = createRes.body.id;

    const searchRes = await request(app)
      .get("/exercises/search?searchTerm=Test Push Up")
      .set("Authorization", \`Bearer \${token}\`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBeGreaterThan(0);

    const deleteRes = await request(app)
      .delete(\`/exercises/\${exerciseId}\`)
      .set("Authorization", \`Bearer \${token}\`);

    expect(deleteRes.status).toBe(204);
  });
});
`
);

// ─── Prisma Seed ───────────────────────────────────────────────────────────────

writeFile(
  "prisma/seed.ts",
  `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Profiles
  const profiles = [
    { id: "00000000-0000-0000-0000-000000000001", name: "Student" },
    { id: "00000000-0000-0000-0000-000000000002", name: "Personal" },
    { id: "00000000-0000-0000-0000-000000000003", name: "Nutritionist" },
    { id: "00000000-0000-0000-0000-000000000004", name: "SelfManaged" },
  ];
  for (const p of profiles) {
    await prisma.profile.upsert({ where: { id: p.id }, update: {}, create: { ...p, status: "A" } });
  }

  // Exercise categories
  const categories = [
    { id: "10000000-0000-0000-0000-000000000001", name: "Cardio" },
    { id: "10000000-0000-0000-0000-000000000002", name: "Strength" },
    { id: "10000000-0000-0000-0000-000000000003", name: "Flexibility" },
    { id: "10000000-0000-0000-0000-000000000004", name: "Functional" },
  ];
  for (const c of categories) {
    await prisma.exerciseCategory.upsert({ where: { id: c.id }, update: {}, create: { ...c, status: "A" } });
  }

  // Muscle groups and muscles
  const muscleGroups = [
    { id: "20000000-0000-0000-0000-000000000001", name: "Chest", muscles: ["Pectoralis Major", "Pectoralis Minor"] },
    { id: "20000000-0000-0000-0000-000000000002", name: "Back", muscles: ["Latissimus Dorsi", "Trapezius", "Rhomboids"] },
    { id: "20000000-0000-0000-0000-000000000003", name: "Shoulders", muscles: ["Anterior Deltoid", "Lateral Deltoid", "Posterior Deltoid"] },
    { id: "20000000-0000-0000-0000-000000000004", name: "Arms", muscles: ["Biceps Brachii", "Triceps Brachii", "Brachialis"] },
    { id: "20000000-0000-0000-0000-000000000005", name: "Core", muscles: ["Rectus Abdominis", "Obliques", "Transverse Abdominis"] },
    { id: "20000000-0000-0000-0000-000000000006", name: "Legs", muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"] },
  ];

  let muscleIndex = 1;
  for (const mg of muscleGroups) {
    await prisma.muscleGroup.upsert({ where: { id: mg.id }, update: {}, create: { id: mg.id, name: mg.name, status: "A" } });
    for (const muscleName of mg.muscles) {
      const muscleId = \`30000000-0000-0000-\${String(muscleIndex).padStart(4, "0")}-000000000001\`;
      await prisma.muscle.upsert({
        where: { id: muscleId },
        update: {},
        create: { id: muscleId, name: muscleName, muscleGroupId: mg.id, status: "A" },
      });
      muscleIndex++;
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
`
);

console.log("\\nAll files created successfully!");
console.log("Next steps:");
console.log("  1. npm install");
console.log("  2. npx prisma generate");
console.log("  3. npx prisma migrate dev --name init  (requires running PostgreSQL)");
console.log("  4. npm test");
