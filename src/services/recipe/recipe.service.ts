import prisma, { type Prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

export const safeRecipeSelect = {
  id: true,
  title: true,
  description: true,
  ingredients: true,
  instructions: true,
  image: true,
  visibility: true,
  isUnpublishedByAdmin: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true } },
} satisfies Prisma.RecipeSelect;

export const publicRecipeWhere = {
  isDeleted: false,
  visibility: "PUBLIC",
  isUnpublishedByAdmin: false,
} satisfies Prisma.RecipeWhereInput;

export const createRecipe = async (data: {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string | null;
  categoryId: string;
  authorId: string;
}) => {
  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, isDeleted: false },
    select: { id: true },
  });

  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      description: data.description,
      ingredients: data.ingredients,
      instructions: data.instructions,
      image: data.image ?? null,
      categoryId: data.categoryId,
      authorId: data.authorId,
    },
    select: safeRecipeSelect,
  });

  return recipe;
};

export const listPublicRecipes = async (query: {
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));

  const where = { ...publicRecipeWhere } satisfies Prisma.RecipeWhereInput;

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      select: safeRecipeSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.recipe.count({ where }),
  ]);

  return { recipes, total, page, limit };
};