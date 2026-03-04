import { Request, Response } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser, getProfessionalFeedbacks } from "./users.service";
import { updateUserSchema } from "./users.schemas";

export async function listUsers(req: Request, res: Response) {
  const { userLat, userLon, maxDistanceKm } = req.query as Record<string, string>;
  const requestingUserId = req.user?.id;
  const users = await getAllUsers(requestingUserId, {
    userLat: userLat ? parseFloat(userLat) : undefined,
    userLon: userLon ? parseFloat(userLon) : undefined,
    maxDistanceKm: maxDistanceKm ? parseInt(maxDistanceKm) : undefined,
  });
  return res.status(200).json(users);
}

export async function getUser(req: Request, res: Response) {
  const user = await getUserById(String(req.params.id));
  return res.status(200).json(user);
}

export async function updateUserHandler(req: Request, res: Response) {
  const payload = updateUserSchema.parse(req.body);
  const updated = await updateUser(String(req.params.id), payload as Parameters<typeof updateUser>[1]);
  return res.status(200).json(updated);
}

export async function deleteUserHandler(req: Request, res: Response) {
  await deleteUser(String(req.params.id));
  return res.status(204).send();
}

export async function getUserFeedbacks(req: Request, res: Response) {
  const feedbacks = await getProfessionalFeedbacks(String(req.params.id));
  return res.status(200).json(feedbacks);
}
