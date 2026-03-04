import { z } from "zod";
export const subscribeSchema = z.object({
  endpoint: z.url(),
  p256dh: z.string(),
  auth: z.string(),
  expirationTime: z.iso.datetime().optional(),
  userAgent: z.string().optional(),
});
