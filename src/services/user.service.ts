import { prisma } from "../lib/prisma";

export class UserService {
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany();

      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }
}
