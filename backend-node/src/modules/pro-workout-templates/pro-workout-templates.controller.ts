import { Request, Response } from "express";
import {
  createTemplate, getTemplateById, getTemplatesByRoutine, updateTemplate,
  deleteTemplate, addExerciseToTemplate, updateExerciseTemplate,
  removeExerciseFromTemplate, reorderExercises,
} from "./pro-workout-templates.service";
import {
  createTemplateSchema, updateTemplateSchema, addExerciseSchema,
  updateExerciseTemplateSchema, reorderSchema,
} from "./pro-workout-templates.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createTemplate(String(req.params.routineId), req.user!.id, createTemplateSchema.parse(req.body)));
}
export async function getById(req: Request, res: Response) {
  return res.json(await getTemplateById(String(req.params.templateId)));
}
export async function byRoutine(req: Request, res: Response) {
  return res.json(await getTemplatesByRoutine(String(req.params.routineId)));
}
export async function update(req: Request, res: Response) {
  return res.json(await updateTemplate(String(req.params.templateId), req.user!.id, updateTemplateSchema.parse(req.body)));
}
export async function remove(req: Request, res: Response) {
  await deleteTemplate(String(req.params.templateId), req.user!.id);
  return res.status(204).send();
}
export async function addExercise(req: Request, res: Response) {
  return res.status(201).json(await addExerciseToTemplate(String(req.params.templateId), req.user!.id, addExerciseSchema.parse(req.body)));
}
export async function updateExercise(req: Request, res: Response) {
  return res.json(await updateExerciseTemplate(String(req.params.exerciseTemplateId), req.user!.id, updateExerciseTemplateSchema.parse(req.body) as Parameters<typeof addExerciseToTemplate>[2]));
}
export async function removeExercise(req: Request, res: Response) {
  await removeExerciseFromTemplate(String(req.params.exerciseTemplateId), req.user!.id);
  return res.status(204).send();
}
export async function reorder(req: Request, res: Response) {
  return res.json(await reorderExercises(String(req.params.templateId), req.user!.id, reorderSchema.parse(req.body)));
}
