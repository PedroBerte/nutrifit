import { z } from "zod";
export const createAppointmentSchema = z.object({
  customerProfessionalBondId: z.uuid(),
  scheduledAt: z.iso.datetime(),
  type: z.enum(["PR", "ON"]).optional().default("PR"),
  addressId: z.uuid().optional(),
});
export const updateAppointmentSchema = z.object({
  scheduledAt: z.iso.datetime().optional(),
  type: z.enum(["PR", "ON"]).optional(),
  status: z.enum(["P", "A", "R", "C"]).optional(),
  addressId: z.uuid().optional(),
});
