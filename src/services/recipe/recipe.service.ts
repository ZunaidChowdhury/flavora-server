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

export const toggleFavorite = async (userId: string, recipeId: string) => {
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, isDeleted: false },
    select: { id: true },
  });

  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId, recipeId } });
  }

  return { isFavorited: !existing };
};

export const isFavorited = async (userId: string, recipeId: string) => {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
    select: { id: true },
  });
  return Boolean(favorite);
};

export const listFavoriteRecipes = async (userId: string) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId, recipe: { isDeleted: false } },
    select: {
      recipe: {
        select: safeRecipeSelect,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map((f) => f.recipe);
};

export const listAllRecipes = async (query: {
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));

  const where: Prisma.RecipeWhereInput = { isDeleted: false };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      select: {
        ...safeRecipeSelect,
        _count: { select: { reviews: true, favoritedBy: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.recipe.count({ where }),
  ]);

  return { recipes, total, page, limit };
};

export const updateAdminVisibility = async (
  id: string,
  isUnpublishedByAdmin: boolean
) => {
  const existing = await prisma.recipe.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  });

  if (!existing) {
    throw new HttpError(404, "Recipe not found");
  }

  return prisma.recipe.update({
    where: { id },
    data: { isUnpublishedByAdmin },
    select: safeRecipeSelect,
  });
};

export const getAdminStats = async () => {
  const [
    totalUsers,
    totalRecipes,
    totalReviews,
    totalCategories,
    recipesByCategory,
    categories,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.recipe.count({ where: { isDeleted: false } }),
    prisma.review.count({ where: { isDeleted: false } }),
    prisma.category.count({ where: { isDeleted: false } }),
    prisma.recipe.groupBy({
      by: ["categoryId"],
      where: { isDeleted: false },
      _count: { _all: true },
    }),
    prisma.category.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
    }),
  ]);

  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const byCategory = recipesByCategory
    .map((row) => ({
      name: nameById.get(row.categoryId) ?? "Unknown",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalUsers,
    totalRecipes,
    totalReviews,
    totalCategories,
    recipesByCategory: byCategory,
  };
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