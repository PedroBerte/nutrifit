import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getAllUsers(
  requestingUserId?: string,
  filter?: { userLat?: number; userLon?: number; maxDistanceKm?: number }
) {
  const users = await prisma.user.findMany({
    where: { status: "A" },
    include: {
      profile: true,
      address: true,
      professionalCredential: true,
      professionalDetails: true,
    },
  });

  const enriched = await Promise.all(
    users.map(async (user) => {
      let isFavorite = false;
      let avgRating: number | null = null;
      let totalFeedbacks = 0;

      if (user.professionalCredential) {
        const feedbacks = await prisma.customerFeedback.findMany({
          where: { professionalId: user.id, status: "A" },
        });
        totalFeedbacks = feedbacks.length;
        avgRating =
          feedbacks.length > 0
            ? Math.round((feedbacks.reduce((sum, f) => sum + f.rate, 0) / feedbacks.length) * 100) / 100
            : null;

        if (requestingUserId) {
          const fav = await prisma.favoriteProfessional.findUnique({
            where: { customerId_professionalId: { customerId: requestingUserId, professionalId: user.id } },
          });
          isFavorite = !!fav;
        }
      }

      return {
        ...user,
        password: undefined,
        passwordHash: undefined,
        averageRating: avgRating,
        totalFeedbacks,
        isFavorite,
      };
    })
  );

  if (filter?.userLat != null && filter?.userLon != null && filter?.maxDistanceKm != null) {
    return enriched.filter((u) => {
      if (!u.address?.latitude || !u.address?.longitude) return false;
      return calculateDistance(filter.userLat!, filter.userLon!, u.address.latitude, u.address.longitude) <= filter.maxDistanceKm!;
    });
  }

  return enriched;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true, address: true, professionalCredential: true, professionalDetails: true },
  });
  if (!user) throw new AppError("User not found", 404);
  return { ...user, password: undefined, passwordHash: undefined };
}

export async function createUser(
  data: {
    profileId: string;
    name: string;
    email: string;
    imageUrl?: string;
    sex?: string;
    phoneNumber?: string;
    dateOfBirth?: string | Date;
    address?: {
      addressLine: string;
      number: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
      addressType?: number;
    };
  }
) {
  return prisma.user.create({
    data: {
      profile: { connect: { id: data.profileId } },
      name: data.name,
      email: data.email,
      imageUrl: data.imageUrl,
      sex: data.sex ?? "",
      phoneNumber: data.phoneNumber ?? "",
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      status: "A",
      address: data.address
        ? {
            create: {
              addressLine: data.address.addressLine,
              number: data.address.number,
              city: data.address.city,
              state: data.address.state,
              zipCode: data.address.zipCode,
              country: data.address.country ?? "Brasil",
              addressType: data.address.addressType ?? 0,
            },
          }
        : undefined,
    },
    include: { profile: true, address: true },
  });
}

export async function geocodeAllUserAddresses() {
  return { message: "Geocoding skipped", processed: 0, success: 0, failed: 0 };
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    imageUrl: string;
    sex: string;
    phoneNumber: string;
    dateOfBirth: Date;
    profileId: string;
  }>
) {
  const user = await prisma.user.update({ where: { id }, data });
  return { ...user, password: undefined, passwordHash: undefined };
}

export async function deleteUser(id: string) {
  await prisma.user.update({ where: { id }, data: { status: "I" } });
}

export async function getProfessionalFeedbacks(professionalId: string) {
  return prisma.customerFeedback.findMany({
    where: { professionalId, status: "A" },
    include: { customer: { select: { id: true, name: true } } },
  });
}
