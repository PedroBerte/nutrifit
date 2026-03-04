import { prisma } from "../../prisma";
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
