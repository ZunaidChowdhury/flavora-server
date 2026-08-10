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
  authorId: true,
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

export const safeRecipeDetailSelect = {
  ...safeRecipeSelect,
  reviews: {
    where: { isDeleted: false },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.RecipeSelect;

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
  search?: string;
  categoryId?: string;
  sort?: "newest" | "oldest";
}) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));

  const where: Prisma.RecipeWhereInput = {
    ...publicRecipeWhere,
    ...(query.search?.trim()
      ? { title: { contains: query.search.trim(), mode: "insensitive" } }
      : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  };

  const orderBy: Prisma.RecipeOrderByWithRelationInput =
    query.sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      select: safeRecipeSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.recipe.count({ where }),
  ]);

  return { recipes, total, page, limit };
};

export const getRecipeById = async (id: string) => {
  const recipe = await prisma.recipe.findFirst({
    where: { id, isDeleted: false },
    select: safeRecipeDetailSelect,
  });

  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  return recipe;
};

export const listMyRecipes = async (userId: string) => {
  const recipes = await prisma.recipe.findMany({
    where: { authorId: userId, isDeleted: false },
    select: safeRecipeSelect,
    orderBy: { createdAt: "desc" },
  });

  return recipes;
};

export const updateRecipe = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    ingredients?: string[];
    instructions?: string;
    image?: string | null;
    categoryId?: string;
  }
) => {
  const existing = await prisma.recipe.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  });

  if (!existing) {
    throw new HttpError(404, "Recipe not found");
  }

  if (data.categoryId !== undefined) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, isDeleted: false },
      select: { id: true },
    });
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.ingredients !== undefined
        ? { ingredients: data.ingredients }
        : {}),
      ...(data.instructions !== undefined
        ? { instructions: data.instructions }
        : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
    },
    select: safeRecipeSelect,
  });

  return recipe;
};

export const updateRecipeVisibility = async (
  id: string,
  visibility: "PUBLIC" | "PRIVATE"
) => {
  const existing = await prisma.recipe.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, isUnpublishedByAdmin: true },
  });

  if (!existing) {
    throw new HttpError(404, "Recipe not found");
  }

  if (existing.isUnpublishedByAdmin) {
    throw new HttpError(
      403,
      "This recipe was unpublished by an admin and cannot change visibility"
    );
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: { visibility },
    select: safeRecipeSelect,
  });

  return recipe;
};

export const softDeleteRecipe = async (id: string) => {
  const existing = await prisma.recipe.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  });

  if (!existing) {
    throw new HttpError(404, "Recipe not found");
  }

  await prisma.recipe.update({
    where: { id },
    data: { isDeleted: true },
  });

  return null;
};