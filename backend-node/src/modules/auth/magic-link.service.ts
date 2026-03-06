import crypto from "node:crypto";
import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";
import { createAccessToken } from "./auth.service";

const ML_TTL_SECONDS = 15 * 60; // 15 minutes
const memoryMagicLinks = new Map<string, { userId: string; expiresAt: number }>();

function cleanupExpiredMagicLinks() {
  const now = Date.now();
  for (const [key, value] of memoryMagicLinks.entries()) {
    if (value.expiresAt <= now) {
      memoryMagicLinks.delete(key);
    }
  }
}

async function setMagicLinkUser(tokenHash: string, userId: string) {
  cleanupExpiredMagicLinks();
  memoryMagicLinks.set(tokenHash, {
    userId,
    expiresAt: Date.now() + ML_TTL_SECONDS * 1000,
  });
}

async function consumeMagicLinkUser(tokenHash: string): Promise<string | null> {
  cleanupExpiredMagicLinks();

  const memoryToken = memoryMagicLinks.get(tokenHash);
  if (!memoryToken) {
    return null;
  }

  if (memoryToken.expiresAt <= Date.now()) {
    memoryMagicLinks.delete(tokenHash);
    return null;
  }

  memoryMagicLinks.delete(tokenHash);
  return memoryToken.userId;
}

export async function sendMagicLink(
  email: string,
  baseAppUrl: string,
  _ip?: string,
  _ua?: string,
  invited?: boolean,
  professionalInviterId?: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    // Auto-provision user with Student profile on first magic link request
    const studentProfile = await prisma.profile.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: { id: "00000000-0000-0000-0000-000000000001", name: "Student", status: "A" },
    });

    user = await prisma.user.create({
      data: {
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        profileId: studentProfile.id,
        status: "A",
        sex: "",
        phoneNumber: "",
      },
    });

    // Handle professional inviter bond creation stub
    if (invited && professionalInviterId) {
      const personalProfile = await prisma.profile.findUnique({
        where: { id: "00000000-0000-0000-0000-000000000002" },
      });
      const professional = await prisma.user.findFirst({
        where: { id: professionalInviterId, profileId: personalProfile?.id },
      });
      if (professional) {
        await prisma.customerProfessionalBond.create({
          data: {
            customerId: user.id,
            professionalId: professional.id,
            senderId: professional.id,
            status: "P",
          },
        });
      }
    }
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  await setMagicLinkUser(tokenHash, user.id);

  // In production, send email. For now, log to console.
  const magicUrl = `${baseAppUrl}/auth/validate?token=${rawToken}`;
  console.log(`[MagicLink] ${normalizedEmail} → ${magicUrl}`);
}

export async function validateMagicLink(rawToken: string): Promise<string> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const userId = await consumeMagicLinkUser(tokenHash);
  if (!userId) {
    throw new AppError("Invalid or expired magic link token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const claims = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    profile: user.profile.name,
    // firstAccess = true when auto-provisioned (no address yet = registration not completed)
    firstAccess: !user.addressId,
  };

  return createAccessToken(claims);
}
