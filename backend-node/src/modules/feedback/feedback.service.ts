import { prisma } from "../../prisma";
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
