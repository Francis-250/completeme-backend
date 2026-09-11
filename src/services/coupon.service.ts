import { CreateCouponData, UpdateCouponData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";

export const couponService = {
  create: async (data: CreateCouponData) => {
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new Error("COUPON_CODE_EXISTS");
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive ?? true,
      },
    });

    return coupon;
  },

  getAll: async (includeInactive = false) => {
    const where = includeInactive ? {} : { isActive: true };

    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return coupons;
  },

  getByCode: async (code: string) => {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    return coupon;
  },

  getById: async (id: string) => {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    return coupon;
  },

  validate: async (code: string, userId: string, orderAmount: number) => {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new Error("COUPON_NOT_FOUND");
    }

    if (!coupon.isActive) {
      throw new Error("COUPON_INACTIVE");
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new Error("COUPON_EXPIRED");
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new Error("MIN_ORDER_AMOUNT_NOT_MET");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error("COUPON_USAGE_LIMIT_REACHED");
    }

    // Check if user already used this coupon
    const userUsage = await prisma.couponUsage.findFirst({
      where: { couponId: coupon.id, userId },
    });

    if (userUsage) {
      throw new Error("COUPON_ALREADY_USED");
    }

    // Calculate discount
    let discountAmount = 0;

    switch (coupon.discountType) {
      case "PERCENTAGE":
        discountAmount = (orderAmount * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
          discountAmount = Number(coupon.maxDiscount);
        }
        break;
      case "FIXED_AMOUNT":
        discountAmount = Number(coupon.discountValue);
        if (discountAmount > orderAmount) {
          discountAmount = orderAmount;
        }
        break;
      case "FREE_SHIPPING":
        discountAmount = 0; // Handled separately in checkout
        break;
    }

    return { coupon, discountAmount };
  },

  update: async (id: string, data: UpdateCouponData) => {
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      throw new Error("COUPON_NOT_FOUND");
    }

    if (data.code && data.code !== existingCoupon.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      });

      if (codeExists) {
        throw new Error("COUPON_CODE_EXISTS");
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code.toUpperCase() }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount }),
        ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return coupon;
  },

  delete: async (id: string) => {
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      include: { usages: true, orders: true },
    });

    if (!existingCoupon) {
      throw new Error("COUPON_NOT_FOUND");
    }

    if (existingCoupon.usages.length > 0 || existingCoupon.orders.length > 0) {
      throw new Error("COUPON_HAS_USAGE");
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return { success: true };
  },
};