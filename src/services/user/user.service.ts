import prisma, { type Prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import { HttpError } from "../../utils/httpError";

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, "Email is already registered");
  }

  const role =
    email === process.env.ADMIN_EMAIL?.toLowerCase() ? "ADMIN" : "USER";

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email,
      password: await hashPassword(data.password),
      role,
    },
    select: safeUserSelect,
  });

  const token = signToken({ id: user.id, role: user.role });

  return { token, user };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const email = data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isDeleted) {
    throw new HttpError(401, "Invalid credentials");
  }

  const passwordOk = await comparePassword(data.password, user.password);
  if (!passwordOk) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isAdmin = email === process.env.ADMIN_EMAIL?.toLowerCase();
  const role: "USER" | "ADMIN" = isAdmin ? "ADMIN" : user.role;

  const synced = await prisma.user.update({
    where: { id: user.id },
    data: { role },
    select: safeUserSelect,
  });

  const token = signToken({ id: synced.id, role: synced.role });

  return { token, user: synced };
};

export const listUsers = async (query: {
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { isDeleted: false },
      select: safeUserSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { isDeleted: false } }),
  ]);

  return { users, total, page, limit };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    select: safeUserSelect,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
};
