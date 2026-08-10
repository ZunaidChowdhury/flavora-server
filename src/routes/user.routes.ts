import { Router } from "express";
import type { Request } from "express";
import prisma from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { verifyToken } from "../middlewares/verifyToken";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import { verifyUser } from "../middlewares/verifyUser";
import { listUsers, getUser } from "../services/user/user.controller";

const resolveUserOwner = async (req: Request): Promise<string | null> => {
  const target = await prisma.user.findFirst({
    where: { id: String(req.params.id), isDeleted: false },
    select: { id: true },
  });

  if (!target) {
    throw new HttpError(404, "User not found");
  }

  return target.id;
};

const router = Router();

router.get("/", verifyToken, verifyAdmin, listUsers);
router.get("/:id", verifyToken, verifyUser(resolveUserOwner), getUser);

export default router;
