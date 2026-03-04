import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";

const SELF_MANAGED_PROFILE_ID =
  process.env.SELF_MANAGED_PROFILE_ID ?? "00000000-0000-0000-0000-000000000004";

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
  const user = await prisma.user.findUnique({
    where: { id: customerId },
    select: { profileId: true },
  });

  if (user?.profileId === SELF_MANAGED_PROFILE_ID) {
    const [total, routines] = await Promise.all([
      prisma.routine.count({ where: { personalId: customerId, status: "A" } }),
      prisma.routine.findMany({
        where: { personalId: customerId, status: "A" },
        include: routineInclude,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const data = routines.map((routine) => ({
      id: `self-${routine.id}`,
      routineId: routine.id,
      customerId,
      status: "A",
      expiresAt: null,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
      routine,
    }));

    return { total, page, pageSize, data };
  }

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
