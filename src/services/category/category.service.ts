import prisma, { type Prisma } from "../../lib/prisma";
import { HttpError } from "../../utils/httpError";

export const safeCategorySelect = {
  id: true,
  name: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

export const createCategory = async (data: { name: string }) => {
  const name = data.name.trim();

  const existing = await prisma.category.findFirst({
    where: { name, isDeleted: false },
    select: { id: true },
  });
  if (existing) {
    throw new HttpError(409, "Category already exists");
  }

  const category = await prisma.category.create({
    data: { name },
    select: safeCategorySelect,
  });

  return category;
};

export const listCategories = async (query: {
  includeInactive?: boolean;
}) => {
  const categories = await prisma.category.findMany({
    where: {
      isDeleted: false,
      ...(query.includeInactive ? {} : { status: "ACTIVE" }),
    },
    select: safeCategorySelect,
    orderBy: { name: "asc" },
  });

  return categories;
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
    select: safeCategorySelect,
  });

  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  return category;
};

export const updateCategory = async (
  id: string,
  data: { name?: string; status?: "ACTIVE" | "INACTIVE" | "ARCHIVED" }
) => {
  const existing = await prisma.category.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existing) {
    throw new HttpError(404, "Category not found");
  }

  if (typeof data.name === "string" && data.name.trim()) {
    const name = data.name.trim();
    const clash = await prisma.category.findFirst({
      where: { name, isDeleted: false, id: { not: id } },
      select: { id: true },
    });
    if (clash) {
      throw new HttpError(409, "Category name already in use");
    }
    data.name = name;
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    select: safeCategorySelect,
  });

  return category;
};

export const softDeleteCategory = async (id: string) => {
  const existing = await prisma.category.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  });

  if (!existing) {
    throw new HttpError(404, "Category not found");
  }

  await prisma.category.update({
    where: { id },
    data: { isDeleted: true },
  });

  return null;
};
