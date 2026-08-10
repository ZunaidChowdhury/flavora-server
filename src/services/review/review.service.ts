import prisma, { type Prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

export const safeReviewSelect = {
  id: true,
  rating: true,
  comment: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true } },
  recipe: { select: { id: true, title: true } },
} satisfies Prisma.ReviewSelect;

export const createReview = async (data: {
  userId: string;
  recipeId: string;
  rating: number;
  comment: string;
}) => {
  const recipe = await prisma.recipe.findFirst({
    where: { id: data.recipeId, isDeleted: false },
    select: { id: true },
  });

  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  return prisma.review.create({
    data: {
      userId: data.userId,
      recipeId: data.recipeId,
      rating: data.rating,
      comment: data.comment,
    },
    select: safeReviewSelect,
  });
};

export const listReviews = async (recipeId?: string) => {
  return prisma.review.findMany({
    where: {
      isDeleted: false,
      ...(recipeId ? { recipeId } : {}),
    },
    select: safeReviewSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const getReviewById = async (id: string) => {
  const review = await prisma.review.findFirst({
    where: { id, isDeleted: false },
    select: safeReviewSelect,
  });

  if (!review) {
    throw new HttpError(404, "Review not found");
  }

  return review;
};
