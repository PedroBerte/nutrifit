import { z } from "zod";

const guidSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  profileId: guidSchema,
  sex: z.string().optional().default(""),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional().default(""),
  imageUrl: z.url().optional(),
});

export const updateUserSchema = createUserSchema.partial();
