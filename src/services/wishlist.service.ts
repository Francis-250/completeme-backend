import { CreateWishlistData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";

export const wishlistService = {
  getAll: async (userId: string) => {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            variants: { include: { images: true } },
            category: true,
            brand: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return wishlistItems;
  },

  add: async (userId: string, data: CreateWishlistData) => {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    });

    if (existing) {
      throw new Error("PRODUCT_ALREADY_IN_WISHLIST");
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId: data.productId,
      },
      include: {
        product: {
          include: {
            images: true,
            variants: { include: { images: true } },
            category: true,
            brand: true,
          },
        },
      },
    });

    return wishlistItem;
  },

  remove: async (userId: string, productId: string) => {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new Error("PRODUCT_NOT_IN_WISHLIST");
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return { success: true };
  },

  check: async (userId: string, productId: string) => {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!item;
  },

  clear: async (userId: string) => {
    await prisma.wishlistItem.deleteMany({
      where: { userId },
    });

    return { success: true };
  },
};