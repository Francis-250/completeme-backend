import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { LoginInput, RegisterInput } from "./../validators/auth.validator";
import { signToken } from "../lib/jwt";
import { AppError } from "../utils/error-response";

export const authService = {
  register: async ({ firstName, lastName, email, password }: RegisterInput) => {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) throw new Error("User with this email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = signToken({ userId: user.id });

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  },
  login: async ({ email, password }: LoginInput) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError("Invalid email or password", 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError("Invalid email or password", 401);

    const token = signToken({ userId: user.id });
    return {
      token,
      user: {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
      },
    };
  },

  getUser: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
};
