import { prisma } from "../../prisma";
import { AppError } from "../../common/app-error";

export async function addFavorite(customerId: string, professionalId: string) {
  return prisma.favoriteProfessional.create({
    data: { customerId, professionalId },
    include: { professional: { select: { id: true, name: true, email: true, imageUrl: true } } },
  });
}

export async function removeFavorite(customerId: string, professionalId: string) {
  const fav = await prisma.favoriteProfessional.findUnique({
    where: { customerId_professionalId: { customerId, professionalId } },
  });
  if (!fav) throw new AppError("Favorite not found", 404);
  await prisma.favoriteProfessional.delete({ where: { customerId_professionalId: { customerId, professionalId } } });
}

export async function listFavorites(customerId: string) {
  return prisma.favoriteProfessional.findMany({
    where: { customerId },
    include: { professional: { select: { id: true, name: true, email: true, imageUrl: true, professionalCredential: true } } },
  });
}
