import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";

export async function subscribe(
  userId: string,
  data: { endpoint: string; p256dh: string; auth: string; expirationTime?: string; userAgent?: string }
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    update: { isActive: true, p256dh: data.p256dh, auth: data.auth },
    create: {
      userId,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      expirationTime: data.expirationTime ? new Date(data.expirationTime) : undefined,
      userAgent: data.userAgent,
    },
  });
}

export async function unsubscribe(userId: string, endpoint: string) {
  const sub = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  if (!sub || sub.userId !== userId) throw new AppError("Subscription not found", 404);
  await prisma.pushSubscription.update({ where: { endpoint }, data: { isActive: false } });
}

export async function getActiveSubscriptions(userId: string) {
  return prisma.pushSubscription.findMany({ where: { userId, isActive: true } });
}
