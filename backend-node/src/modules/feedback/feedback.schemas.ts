import { z } from "zod";
export const createFeedbackSchema = z.object({
  professionalId: z.uuid(),
  testimony: z.string().optional(),
  rate: z.number().int().min(1).max(5),
  type: z.number().int().optional().default(0),
});
