import { CreateOrderData, CreateOrderItemData, UpdateOrderData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { cartService } from "./cart.service";
import { couponService } from "./coupon.service";

export const orderService = {
  create: async (userId: string, data: CreateOrderData) => {
    // Get cart items if not provided
    let items = data.items;

    if (!items || items.length === 0) {
      const cart = await cartService.getAll(userId);
      items = cart.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: Number(item.variant.price),
      }));
    }

    if (!items || items.length === 0) {
      throw new Error("CART_EMPTY");
    }

    // Validate variants and calculate totals
    let subtotal = 0;
    const orderItems: CreateOrderItemData[] = [];

    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new Error(`VARIANT_NOT_FOUND: ${item.variantId}`);
      }

      if (!variant.product.isActive) {
        throw new Error(`PRODUCT_NOT_ACTIVE: ${variant.product.name}`);
      }

      if (variant.stockQuantity < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK: ${variant.product.name}`);
      }

      const priceAtPurchase = item.priceAtPurchase ?? Number(variant.price);
      subtotal += priceAtPurchase * item.quantity;

      orderItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase,
      });
    }

    let discountAmount = 0;
    let couponId = data.couponId;

    // Validate coupon if provided
    if (data.couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: data.couponId },
      });

      if (!coupon) {
        throw new Error("COUPON_NOT_FOUND");
      }

      const now = new Date();
      if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
        throw new Error("COUPON_EXPIRED");
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error("COUPON_USAGE_LIMIT_REACHED");
      }

      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        throw new Error("MIN_ORDER_AMOUNT_NOT_MET");
      }

      // Check if user already used
      const userUsage = await prisma.couponUsage.findFirst({
        where: { couponId: coupon.id, userId },
      });

      if (userUsage) {
        throw new Error("COUPON_ALREADY_USED");
      }

      // Calculate discount
      switch (coupon.discountType) {
        case "PERCENTAGE":
          discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
          }
          break;
        case "FIXED_AMOUNT":
          discountAmount = Number(coupon.discountValue);
          if (discountAmount > subtotal) {
            discountAmount = subtotal;
          }
          break;
        case "FREE_SHIPPING":
          discountAmount = 0; // Shipping handled separately
          break;
      }

      couponId = coupon.id;
    }

    const taxAmount = data.taxAmount ?? 0;
    const shippingAmount = data.shippingAmount ?? 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Validate shipping address if provided
    if (data.shippingAddressId) {
      const address = await prisma.userAddress.findUnique({
        where: { id: data.shippingAddressId },
      });

      if (!address || address.userId !== userId) {
        throw new Error("INVALID_SHIPPING_ADDRESS");
      }
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          couponId,
          totalAmount,
          taxAmount,
          shippingAmount,
          discountAmount,
          status: data.status ?? "PENDING",
          shippingAddressId: data.shippingAddressId,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: {
                    include: { images: true },
                  },
                },
              },
            },
          },
          user: true,
          coupon: true,
          shippingAddress: true,
        },
      });

      // Update variant stock
      for (const item of orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { decrement: item.quantity } },
          });

          // Create stock transaction
          await tx.stockTransaction.create({
            data: {
              variantId: item.variantId,
              quantity: -item.quantity,
              type: "SALE",
              reference: newOrder.id,
            },
          });
        }
      }

      // Update coupon usage if applicable
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });

        await tx.couponUsage.create({
          data: {
            couponId,
            userId,
            orderId: newOrder.id,
          },
        });
      }

      // Clear cart if items came from cart
      if (!data.items || data.items.length === 0) {
        await tx.cartItem.deleteMany({ where: { userId } });
      }

      return newOrder;
    });

    return order;
  },

  getAll: async (filters: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const { userId, status, page = 1, limit = 20 } = filters;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (status && status !== "all") where.status = (status as string).toUpperCase() as any;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: { include: { images: true } },
                },
              },
            },
          },
          user: { select: { id: true, name: true, email: true } },
          coupon: true,
          shippingAddress: true,
          payments: true,
          shipments: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getById: async (id: string) => {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: { include: { images: true } },
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true, phoneNumber: true } },
        coupon: true,
        shippingAddress: true,
        payments: true,
        shipments: {
          include: { order: true },
        },
      },
    });

    return order;
  },

  update: async (id: string, data: UpdateOrderData, userId?: string, isAdmin = false) => {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!existingOrder) {
      throw new Error("ORDER_NOT_FOUND");
    }

    // Non-admin users can only update their own orders
    if (!isAdmin && existingOrder.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    // Non-admin users can only cancel orders
    if (!isAdmin && data.status && data.status !== "CANCELLED") {
      throw new Error("FORBIDDEN");
    }

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        PENDING: ["PROCESSING", "CANCELLED"],
        PROCESSING: ["SHIPPED", "CANCELLED"],
        SHIPPED: ["DELIVERED", "RETURNED"],
        DELIVERED: ["RETURNED"],
        CANCELLED: [],
        RETURNED: [],
      };

      const allowed = validTransitions[existingOrder.status] || [];
      if (!allowed.includes(data.status)) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }
    }

    if (data.shippingAddressId) {
      const address = await prisma.userAddress.findUnique({
        where: { id: data.shippingAddressId },
      });

      if (!address || address.userId !== existingOrder.userId) {
        throw new Error("INVALID_SHIPPING_ADDRESS");
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.shippingAddressId !== undefined && { shippingAddressId: data.shippingAddressId }),
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: { include: { images: true } },
              },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
        coupon: true,
        shippingAddress: true,
        payments: true,
        shipments: true,
      },
    });

    // If order cancelled, restore stock
    if (data.status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        for (const item of existingOrder.orderItems) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: item.quantity } },
            });

            await tx.stockTransaction.create({
              data: {
                variantId: item.variantId,
                quantity: item.quantity,
                type: "RETURN",
                reference: id,
              },
            });
          }
        }

        // Restore coupon usage
        if (existingOrder.couponId) {
          await tx.coupon.update({
            where: { id: existingOrder.couponId },
            data: { usedCount: { decrement: 1 } },
          });

          await tx.couponUsage.deleteMany({
            where: { orderId: id },
          });
        }
      });
    }

    return order;
  },

  cancel: async (id: string, userId?: string, isAdmin = false) => {
    return orderService.update(id, { status: "CANCELLED" }, userId, isAdmin);
  },

  getStats: async (userId?: string) => {
    const where = userId ? { userId } : {};

    const [totalOrders, totalRevenue, statusCounts] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
      }),
    ]);

    const stats = {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  },
};