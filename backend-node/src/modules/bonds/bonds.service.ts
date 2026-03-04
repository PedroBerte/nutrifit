import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";

const SELF_MANAGED_PROFILE_ID =
  process.env.SELF_MANAGED_PROFILE_ID ?? "00000000-0000-0000-0000-000000000004";

const bondInclude = {
  customer: { select: { id: true, name: true, email: true, imageUrl: true } },
  professional: { select: { id: true, name: true, email: true, imageUrl: true, professionalCredential: true } },
  sender: { select: { id: true, name: true, email: true } },
} as const;

async function ensureImplicitSelfBond(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, profileId: true },
  });

  if (!user || user.profileId !== SELF_MANAGED_PROFILE_ID) {
    return;
  }

  const existingSelfBond = await prisma.customerProfessionalBond.findFirst({
    where: { customerId: userId, professionalId: userId },
    orderBy: { createdAt: "desc" },
  });

  if (!existingSelfBond) {
    await prisma.customerProfessionalBond.create({
      data: {
        customerId: userId,
        professionalId: userId,
        senderId: userId,
        status: "A",
      },
    });
    return;
  }

  if (existingSelfBond.status !== "A") {
    await prisma.customerProfessionalBond.update({
      where: { id: existingSelfBond.id },
      data: { status: "A" },
    });
  }
}

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
  await ensureImplicitSelfBond(customerId);
  return prisma.customerProfessionalBond.findMany({ where: { customerId }, include: bondInclude });
}

export async function getBondsAsProfessional(professionalId: string) {
  await ensureImplicitSelfBond(professionalId);
  return prisma.customerProfessionalBond.findMany({ where: { professionalId }, include: bondInclude });
}

export async function getBondsByUser(userId: string) {
  await ensureImplicitSelfBond(userId);
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
  await ensureImplicitSelfBond(professionalId);

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
