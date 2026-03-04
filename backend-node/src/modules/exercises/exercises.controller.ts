import { Request, Response } from "express";
import {
  listExercises, searchExercises, getExerciseById, getCategories,
  getMuscleGroups, getExercisesByMuscleGroup, createExercise,
  updateExercise, updateExerciseMedia, deleteExercise, getUserExercises,
} from "./exercises.service";
import { createExerciseSchema, updateExerciseSchema, updateExerciseMediaSchema } from "./exercises.schemas";

export async function list(req: Request, res: Response) {
  const { page = "1", pageSize = "50" } = req.query as Record<string, string>;
  return res.json(await listExercises(parseInt(page), parseInt(pageSize), req.user?.id));
}
export async function search(req: Request, res: Response) {
  const { searchTerm = "", categoryId, page = "1", pageSize = "20" } = req.query as Record<string, string>;
  return res.json(await searchExercises(searchTerm, categoryId, parseInt(page), parseInt(pageSize), req.user?.id));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getExerciseById(String(req.params.exerciseId)));
}
export async function listCategories(_req: Request, res: Response) {
  return res.json(await getCategories());
}
export async function listMuscleGroups(_req: Request, res: Response) {
  return res.json(await getMuscleGroups());
}
export async function byMuscleGroup(req: Request, res: Response) {
  return res.json(await getExercisesByMuscleGroup(String(req.params.muscleGroupId)));
}
export async function create(req: Request, res: Response) {
  const data = createExerciseSchema.parse(req.body);
  return res.status(201).json(await createExercise(req.user!.id, data));
}
export async function update(req: Request, res: Response) {
  const data = updateExerciseSchema.parse(req.body);
  return res.json(await updateExercise(String(req.params.exerciseId), req.user!.id, data as Parameters<typeof createExercise>[1]));
}
export async function patchMedia(req: Request, res: Response) {
  const data = updateExerciseMediaSchema.parse(req.body);
  return res.json(await updateExerciseMedia(String(req.params.exerciseId), data));
}
export async function remove(req: Request, res: Response) {
  await deleteExercise(String(req.params.exerciseId), req.user!.id);
  return res.status(204).send();
}
export async function myExercises(req: Request, res: Response) {
  const { page = "1", pageSize = "50" } = req.query as Record<string, string>;
  return res.json(await getUserExercises(req.user!.id, parseInt(page), parseInt(pageSize)));
}
