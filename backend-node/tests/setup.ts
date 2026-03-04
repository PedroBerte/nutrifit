import { prisma } from "../src/prisma";

const SELF_MANAGED_PROFILE_ID = "00000000-0000-0000-0000-000000000004";

export async function resetTestDb() {
  await prisma.weeklyGoal.deleteMany();
  await prisma.workoutSession.deleteMany({ where: { userId: { not: null } } });
  await prisma.workoutTemplate.deleteMany({ where: { userId: { not: null } } });
  await prisma.user.deleteMany({ where: { profileId: SELF_MANAGED_PROFILE_ID } });
}
