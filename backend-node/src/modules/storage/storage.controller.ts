import { Request, Response } from "express";
import { AppError } from "../../common/app-error";
import { deleteFile, getPresignedUrl, uploadFile } from "./storage.service";
import { prisma } from "../../prisma";

export async function uploadImageHandler(req: Request, res: Response) {
  const file = (req as any).file as { buffer: Buffer; mimetype: string; originalname: string } | undefined;
  if (!file) throw new AppError("No file provided", 400);
  const url = await uploadFile(file.buffer, file.mimetype, file.originalname);
  return res.status(200).json({ url });
}

export async function uploadExerciseMediaHandler(req: Request, res: Response) {
  const file = (req as any).file as { buffer: Buffer; mimetype: string; originalname: string } | undefined;
  if (!file) throw new AppError("No file provided", 400);
  const url = await uploadFile(file.buffer, file.mimetype, file.originalname, "exercises");
    await prisma.exercise.update({ where: { id: String(req.params.exerciseId) }, data: { imageUrl: url } });
  return res.status(200).json({ url });
}

export async function deleteExerciseMediaHandler(req: Request, res: Response) {
  const exercise = await prisma.exercise.findUnique({ where: { id: String(req.params.exerciseId) } });
  if (!exercise?.imageUrl) throw new AppError("Exercise has no media", 404);
  const objectName = exercise.imageUrl.split("/").slice(-2).join("/");
  await deleteFile(objectName);
    await prisma.exercise.update({ where: { id: String(req.params.exerciseId) }, data: { imageUrl: null } });
  return res.status(204).send();
}

export async function deleteImageHandler(req: Request, res: Response) {
  await deleteFile(decodeURIComponent(String(req.params.objectName)));
  return res.status(204).send();
}

export async function getPresignedUrlHandler(req: Request, res: Response) {
  const url = await getPresignedUrl(decodeURIComponent(String(req.params.objectName)));
  return res.status(200).json({ url });
}
