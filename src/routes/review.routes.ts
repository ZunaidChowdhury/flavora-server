import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createReview,
  listReviews,
  getReview,
} from "../services/review/review.controller";

const router = Router();

router.post("/", verifyToken, createReview);
router.get("/", listReviews);
router.get("/:id", getReview);

export default router;
