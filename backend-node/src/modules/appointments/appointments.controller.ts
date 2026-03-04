import { Request, Response } from "express";
import { createAppointment, listAppointments, updateAppointment, deleteAppointment } from "./appointments.service";
import { createAppointmentSchema, updateAppointmentSchema } from "./appointments.schemas";

export async function create(req: Request, res: Response) {
  return res.status(201).json(await createAppointment(createAppointmentSchema.parse(req.body)));
}
export async function list(req: Request, res: Response) {
  return res.json(await listAppointments(req.user!.id));
}
export async function update(req: Request, res: Response) {
  return res.json(await updateAppointment(String(req.params.id), updateAppointmentSchema.parse(req.body)));
}
export async function remove(req: Request, res: Response) {
  await deleteAppointment(String(req.params.id));
  return res.status(204).send();
}
