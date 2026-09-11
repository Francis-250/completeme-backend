import { CreateCartItemData, UpdateCartItemData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";

export const cartService = {
  getAll: async (userId: string) => {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                brand: true,
              },
            },
            images: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return cartItems;
  },

  add: async (userId: string, data: CreateCartItemData) => {
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new Error("VARIANT_NOT_FOUND");
    }

    if (!variant.product.isActive) {
      throw new Error("PRODUCT_NOT_ACTIVE");
    }

    if (variant.stockQuantity < data.quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId: data.variantId,
        },
      },
    });

    if (existing) {
      const newQuantity = existing.quantity + data.quantity;

      if (variant.stockQuantity < newQuantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const cartItem = await prisma.cartItem.update({
        where: { userId_variantId: { userId, variantId: data.variantId } },
        data: { quantity: newQuantity },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: true,
                  category: true,
                  brand: true,
                },
              },
              images: true,
            },
          },
        },
      });

      return cartItem;
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        variantId: data.variantId,
        quantity: data.quantity,
      },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                brand: true,
              },
            },
            images: true,
          },
        },
      },
    });

    return cartItem;
  },

  update: async (userId: string, variantId: string, data: UpdateCartItemData) => {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new Error("VARIANT_NOT_FOUND");
    }

    if (variant.stockQuantity < data.quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
    });

    if (!existing) {
      throw new Error("CART_ITEM_NOT_FOUND");
    }

    const cartItem = await prisma.cartItem.update({
      where: { userId_variantId: { userId, variantId } },
      data: { quantity: data.quantity },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                brand: true,
              },
            },
            images: true,
          },
        },
      },
    });

    return cartItem;
  },

  remove: async (userId: string, variantId: string) => {
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
    });

    if (!existing) {
      throw new Error("CART_ITEM_NOT_FOUND");
    }

    await prisma.cartItem.delete({
      where: {
        userId_variantId: {
          userId,
          variantId,
        },
      },
    });

    return { success: true };
  },

  clear: async (userId: string) => {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { success: true };
  },

  getSummary: async (userId: string) => {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            images: true,
          },
        },
      },
    });

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0
    );

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cartItems,
      subtotal,
      itemCount,
    };
  },
};