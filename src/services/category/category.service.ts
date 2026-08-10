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
