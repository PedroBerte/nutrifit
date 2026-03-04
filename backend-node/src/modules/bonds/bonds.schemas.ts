import { z } from "zod";

export const createBondSchema = z.object({
  customerId: z.uuid(),
  professionalId: z.uuid(),
});

export const updateBondSchema = z.object({
  status: z.enum(["P", "A", "R", "C"]),
});
