import { prisma } from "../lib/prisma";

export const stockTransactionService = {
  create: async (data: {
    variantId: string;
    quantity: number;
    type: "RESTOCK" | "SALE" | "RETURN" | "ADJUSTMENT";
    reference?: string;
  }) => {
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.variantId },
    });

    if (!variant) {
      throw new Error("VARIANT_NOT_FOUND");
    }

    const transaction = await prisma.stockTransaction.create({
      data: {
        variantId: data.variantId,
        quantity: data.quantity,
        type: data.type,
        reference: data.reference,
      },
      include: {
        variant: {
          include: {
            product: { include: { images: true } },
          },
        },
      },
    });

    let stockChange = 0;
    switch (data.type) {
      case "RESTOCK":
        stockChange = data.quantity;
        break;
      case "SALE":
        stockChange = -data.quantity;
        break;
      case "RETURN":
        stockChange = data.quantity;
        break;
      case "ADJUSTMENT":
        stockChange = data.quantity;
        break;
    }

    await prisma.productVariant.update({
      where: { id: data.variantId },
      data: { stockQuantity: { increment: stockChange } },
    });

    return transaction;
  },

  getAll: async (filters: {
    variantId?: string;
    type?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const { variantId, type, page = 1, limit = 50 } = filters;

    const where: Record<string, unknown> = {};

    if (variantId) where.variantId = variantId;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        include: {
          variant: {
            include: {
              product: { include: { images: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getByVariantId: async (variantId: string) => {
    const transactions = await prisma.stockTransaction.findMany({
      where: { variantId },
      orderBy: { createdAt: "desc" },
    });

    return transactions;
  },

  getStats: async (variantId?: string) => {
    const where = variantId ? { variantId } : {};

    const transactions = await prisma.stockTransaction.findMany({
      where,
      select: { type: true, quantity: true },
    });

    const stats = {
      RESTOCK: 0,
      SALE: 0,
      RETURN: 0,
      ADJUSTMENT: 0,
    };

    for (const t of transactions) {
      stats[t.type] += t.quantity;
    }

    return stats;
  },
};