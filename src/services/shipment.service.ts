import { CreateShipmentData, UpdateShipmentData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";

export const shipmentService = {
  create: async (data: CreateShipmentData) => {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const existingShipment = await prisma.shipment.findUnique({
      where: { trackingNumber: data.trackingNumber },
    });

    if (existingShipment) {
      throw new Error("TRACKING_NUMBER_EXISTS");
    }

    const shipment = await prisma.shipment.create({
      data: {
        orderId: data.orderId,
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        status: data.status ?? "LABEL_CREATED",
        estimatedDelivery: data.estimatedDelivery,
        shippedAt: data.shippedAt,
        deliveredAt: data.deliveredAt,
      },
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

    if (data.status === "IN_TRANSIT" || data.status === "OUT_FOR_DELIVERY") {
      await prisma.order.update({
        where: { id: data.orderId },
        data: { status: "SHIPPED" },
      });
    }

    if (data.status === "DELIVERED") {
      await prisma.order.update({
        where: { id: data.orderId },
        data: { status: "DELIVERED" },
      });
    }

    return shipment;
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

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
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
      prisma.shipment.count({ where }),
    ]);

    return { shipments, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getById: async (id: string) => {
    const shipment = await prisma.shipment.findUnique({
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

    return shipment;
  },

  getByTrackingNumber: async (trackingNumber: string) => {
    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
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

    return shipment;
  },

  update: async (id: string, data: UpdateShipmentData) => {
    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existingShipment) {
      throw new Error("SHIPMENT_NOT_FOUND");
    }

    if (data.trackingNumber && data.trackingNumber !== existingShipment.trackingNumber) {
      const existing = await prisma.shipment.findUnique({
        where: { trackingNumber: data.trackingNumber },
      });

      if (existing) {
        throw new Error("TRACKING_NUMBER_EXISTS");
      }
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
        ...(data.carrier !== undefined && { carrier: data.carrier }),
        ...(data.trackingNumber !== undefined && { trackingNumber: data.trackingNumber }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.estimatedDelivery !== undefined && { estimatedDelivery: data.estimatedDelivery }),
        ...(data.shippedAt !== undefined && { shippedAt: data.shippedAt }),
        ...(data.deliveredAt !== undefined && { deliveredAt: data.deliveredAt }),
      },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (data.status) {
      if (data.status === "DELIVERED") {
        await prisma.order.update({
          where: { id: existingShipment.orderId },
          data: { status: "DELIVERED" },
        });
      } else if (["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(data.status)) {
        await prisma.order.update({
          where: { id: existingShipment.orderId },
          data: { status: "SHIPPED" },
        });
      }
    }

    return shipment;
  },

  delete: async (id: string) => {
    const existingShipment = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existingShipment) {
      throw new Error("SHIPMENT_NOT_FOUND");
    }

    await prisma.shipment.delete({
      where: { id },
    });

    return { success: true };
  },
};