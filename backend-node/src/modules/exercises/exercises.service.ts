import { prisma } from "../../prisma";
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
