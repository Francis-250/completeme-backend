import { CreatePaymentData, UpdatePaymentData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";

export const paymentService = {
  create: async (data: CreatePaymentData) => {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId: data.transactionId },
    });

    if (existingPayment) {
      throw new Error("TRANSACTION_ID_EXISTS");
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        amount: data.amount,
        status: data.status,
      },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (data.status === "COMPLETED") {
      await prisma.order.update({
        where: { id: data.orderId },
        data: { status: "PROCESSING" },
      });
    }

    return payment;
  },

  getAll: async (filters: {
    orderId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const { orderId, status, page = 1, limit = 20 } = filters;

    const where: Record<string, unknown> = {};

    if (orderId) where.orderId = orderId;
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getById: async (id: string) => {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            orderItems: {
              include: {
                variant: {
                  include: {
                    product: { include: { images: true } },
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return payment;
  },

  getByTransactionId: async (transactionId: string) => {
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return payment;
  },

  update: async (id: string, data: UpdatePaymentData) => {
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (data.status === "COMPLETED") {
      await prisma.order.update({
        where: { id: existingPayment.orderId },
        data: { status: "PROCESSING" },
      });
    }

    if (data.status === "REFUNDED") {
      await prisma.order.update({
        where: { id: existingPayment.orderId },
        data: { status: "RETURNED" },
      });
    }

    return payment;
  },

  delete: async (id: string) => {
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    if (existingPayment.status !== "FAILED") {
      throw new Error("CANNOT_DELETE_COMPLETED_PAYMENT");
    }

    await prisma.payment.delete({
      where: { id },
    });

    return { success: true };
  },
};