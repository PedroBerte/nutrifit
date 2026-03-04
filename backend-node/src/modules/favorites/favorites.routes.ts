import { Router } from "express";
import { ensureAuthenticated } from "../auth/auth.middleware";
import { add, remove, list } from "./favorites.controller";
import { prisma } from "../../prisma";

const router = Router();

// Modern routes
router.post("/favorites", ensureAuthenticated, add);
router.delete("/favorites/:professionalId", ensureAuthenticated, remove);
router.get("/favorites", ensureAuthenticated, list);
router.get("/favorites/check/:professionalId", ensureAuthenticated, async (req, res) => {
  const favorite = await prisma.favoriteProfessional.findUnique({
    where: { customerId_professionalId: { customerId: req.user!.id, professionalId: String(req.params.professionalId) } },
  });
  return res.json({ isFavorite: !!favorite });
});

export default router;
