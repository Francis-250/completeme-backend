import { prisma } from "../lib/prisma";

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  create: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => prisma.user.create({ data }),
};
