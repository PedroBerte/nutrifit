import { Request, Response } from "express";
import { addFavorite, removeFavorite, listFavorites } from "./favorites.service";
import { addFavoriteSchema } from "./favorites.schemas";

export async function add(req: Request, res: Response) {
  const { professionalId } = addFavoriteSchema.parse(req.body);
  return res.status(201).json(await addFavorite(req.user!.id, professionalId));
}
export async function remove(req: Request, res: Response) {
  await removeFavorite(req.user!.id, String(req.params.professionalId));
  return res.status(204).send();
}
export async function list(req: Request, res: Response) {
  return res.json(await listFavorites(req.user!.id));
}
