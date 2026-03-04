import { Request, Response } from "express";
import { subscribe, unsubscribe } from "./push.service";
import { subscribeSchema } from "./push.schemas";

export async function subscribeHandler(req: Request, res: Response) {
  return res.status(201).json(await subscribe(req.user!.id, subscribeSchema.parse(req.body)));
}
export async function unsubscribeHandler(req: Request, res: Response) {
  const { endpoint } = req.body as { endpoint: string };
  await unsubscribe(req.user!.id, endpoint);
  return res.status(204).send();
}
