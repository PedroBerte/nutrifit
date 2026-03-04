import { Request, Response } from "express";
import {
  createRoutine, updateRoutine, deleteRoutine, getRoutineById,
  getRoutinesByPersonal, assignRoutineToCustomer, unassignRoutineFromCustomer,
  getCustomerRoutines, getRoutineCustomers, getRoutinesNearExpiry, updateCustomerRoutineExpiry,
} from "./routines.service";
import { createRoutineSchema, updateRoutineSchema, assignRoutineSchema, updateExpirySchema } from "./routines.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createRoutine(req.user!.id, createRoutineSchema.parse(req.body)));
}
export async function update(req: Request, res: Response) {
  return res.json(await updateRoutine(String(req.params.routineId), req.user!.id, updateRoutineSchema.parse(req.body)));
}
export async function remove(req: Request, res: Response) {
  await deleteRoutine(String(req.params.routineId), req.user!.id);
  return res.status(204).send();
}
export async function getById(req: Request, res: Response) {
  return res.json(await getRoutineById(String(req.params.routineId)));
}
export async function myRoutines(req: Request, res: Response) {
  const { page = "1", pageSize = "10" } = req.query as Record<string, string>;
  return res.json(await getRoutinesByPersonal(req.user!.id, parseInt(page), parseInt(pageSize)));
}
export async function assign(req: Request, res: Response) {
  return res.status(201).json(await assignRoutineToCustomer(req.user!.id, assignRoutineSchema.parse(req.body)));
}
export async function unassign(req: Request, res: Response) {
  await unassignRoutineFromCustomer(String(req.params.routineId), String(req.params.customerId), req.user!.id);
  return res.status(204).send();
}
export async function myAssignedRoutines(req: Request, res: Response) {
  const { page = "1", pageSize = "10" } = req.query as Record<string, string>;
  return res.json(await getCustomerRoutines(req.user!.id, parseInt(page), parseInt(pageSize)));
}
export async function customerRoutinesHandler(req: Request, res: Response) {
  const { page = "1", pageSize = "10" } = req.query as Record<string, string>;
  return res.json(await getCustomerRoutines(String(req.params.customerId), parseInt(page), parseInt(pageSize)));
}
export async function routineCustomers(req: Request, res: Response) {
  return res.json(await getRoutineCustomers(String(req.params.routineId), req.user!.id));
}
export async function nearExpiry(req: Request, res: Response) {
  const { daysThreshold = "7" } = req.query as Record<string, string>;
  return res.json(await getRoutinesNearExpiry(req.user!.id, parseInt(daysThreshold)));
}
export async function updateExpiry(req: Request, res: Response) {
  const { expiresAt } = updateExpirySchema.parse(req.body);
  return res.json(await updateCustomerRoutineExpiry(String(req.params.routineId), String(req.params.customerId), req.user!.id, expiresAt ?? null));
}
