import { z } from "zod";
export const addFavoriteSchema = z.object({ professionalId: z.uuid() });
