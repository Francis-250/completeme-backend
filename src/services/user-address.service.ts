import { CreateUserAddressData, UpdateUserAddressData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";

export const userAddressService = {
  create: async (userId: string, data: CreateUserAddressData) => {
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.create({
      data: {
        userId,
        addressType: data.addressType,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault ?? false,
      },
    });

    return address;
  },

  getAll: async (userId: string) => {
    const addresses = await prisma.userAddress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return addresses;
  },

  getById: async (id: string, userId?: string) => {
    const address = await prisma.userAddress.findUnique({
      where: { id },
    });

    if (!address) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    // Check ownership if userId provided
    if (userId && address.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    return address;
  },

  update: async (id: string, userId: string, data: UpdateUserAddressData) => {
    const existingAddress = await prisma.userAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    if (existingAddress.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.userAddress.update({
      where: { id },
      data: {
        ...(data.addressType !== undefined && { addressType: data.addressType }),
        ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    return address;
  },

  delete: async (id: string, userId: string) => {
    const existingAddress = await prisma.userAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    if (existingAddress.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    // Check if address is used in orders
    const orders = await prisma.order.count({
      where: { shippingAddressId: id },
    });

    if (orders > 0) {
      throw new Error("ADDRESS_USED_IN_ORDERS");
    }

    await prisma.userAddress.delete({
      where: { id },
    });

    return { success: true };
  },

  setDefault: async (id: string, userId: string) => {
    const existingAddress = await prisma.userAddress.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    if (existingAddress.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    await prisma.userAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    const address = await prisma.userAddress.update({
      where: { id },
      data: { isDefault: true },
    });

    return address;
  },
};