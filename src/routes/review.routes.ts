import { Router } from "express";
import type { Request } from "express";
import prisma from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { verifyToken } from "../middlewares/verifyToken";
import { verifyUser } from "../middlewares/verifyUser";
import {
  createReview,
  listReviews,
  getReview,
  updateReview,
  deleteReview,
} from "../services/review/review.controller";

const resolveReviewOwner = async (req: Request): Promise<string | null> => {
  const review = await prisma.review.findFirst({
    where: { id: String(req.params.id), isDeleted: false },
    select: { userId: true },
  });

  if (!review) {
    throw new HttpError(404, "Review not found");
  }

  return review.userId;
};

const router = Router();

router.post("/", verifyToken, createReview);
router.get("/", listReviews);
router.get("/:id", getReview);
router.put("/:id", verifyToken, verifyUser(resolveReviewOwner), updateReview);
router.delete(
  "/:id",
  verifyToken,
  verifyUser(resolveReviewOwner),
  deleteReview
);

export default router;
