import { Request, Response } from "express";
import {
  getAllBonds, getBondById, getBondsBySenderId, getBondsReceivedByUser,
  getBondsAsCustomer, getBondsAsProfessional, getBondsByUser,
  getActiveStudents, createBond, updateBond, deleteBond,
} from "./bonds.service";
import { createBondSchema, updateBondSchema } from "./bonds.schemas";

export async function listBonds(_req: Request, res: Response) {
  return res.json(await getAllBonds());
}
export async function getBond(req: Request, res: Response) {
  return res.json(await getBondById(String(req.params.id)));
}
export async function sentBonds(req: Request, res: Response) {
  return res.json(await getBondsBySenderId(req.user!.id));
}
export async function receivedBonds(req: Request, res: Response) {
  return res.json(await getBondsReceivedByUser(req.user!.id));
}
export async function bondsAsCustomer(req: Request, res: Response) {
  return res.json(await getBondsAsCustomer(req.user!.id));
}
export async function bondsAsProfessional(req: Request, res: Response) {
  return res.json(await getBondsAsProfessional(req.user!.id));
}
export async function myBonds(req: Request, res: Response) {
  return res.json(await getBondsByUser(req.user!.id));
}
export async function activeStudents(req: Request, res: Response) {
  const { page = "1", pageSize = "10", search } = req.query as Record<string, string>;
  return res.json(await getActiveStudents(req.user!.id, parseInt(page), parseInt(pageSize), search));
}
export async function createBondHandler(req: Request, res: Response) {
  const { customerId, professionalId } = createBondSchema.parse(req.body);
  return res.status(201).json(await createBond({ customerId, professionalId, senderId: req.user!.id }));
}
export async function updateBondHandler(req: Request, res: Response) {
  const { status } = updateBondSchema.parse(req.body);
  return res.json(await updateBond(String(req.params.id), status));
}
export async function deleteBondHandler(req: Request, res: Response) {
  await deleteBond(String(req.params.id));
  return res.status(204).send();
}
