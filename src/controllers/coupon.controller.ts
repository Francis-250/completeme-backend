import { Request, Response } from "express";
import { couponService } from "../services/coupon.service";

export const couponController = {
  create: async (req: Request, res: Response) => {
    try {
      const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive } = req.body;

      if (!code?.trim() || !discountType || discountValue === undefined) {
        return res.status(400).json({
          success: false,
          message: "Code, discount type, and discount value are required",
        });
      }

      if (!["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"].includes(discountType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      const coupon = await couponService.create({
        code: code.trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive === "true" : true,
      });

      return res.status(201).json({
        success: true,
        message: "Coupon created successfully",
        data: coupon,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COUPON_CODE_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create coupon",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === "true";

      const coupons = await couponService.getAll(includeInactive);

      return res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch coupons",
      });
    }
  },

  getByCode: async (req: Request<{ code: string }>, res: Response) => {
    try {
      const code: string = req.params.code;

      const coupon = await couponService.getByCode(code);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch coupon",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const coupon = await couponService.getById(id);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch coupon",
      });
    }
  },

  validate: async (req: Request, res: Response) => {
    try {
      const { code, orderAmount } = req.body;
      const userId = req.user?.id;

      if (!code || orderAmount === undefined) {
        return res.status(400).json({
          success: false,
          message: "Code and order amount are required",
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await couponService.validate(code, userId, parseFloat(orderAmount));

      return res.status(200).json({
        success: true,
        message: "Coupon is valid",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: Record<string, string> = {
          COUPON_NOT_FOUND: "Coupon not found",
          COUPON_INACTIVE: "Coupon is inactive",
          COUPON_EXPIRED: "Coupon has expired",
          MIN_ORDER_AMOUNT_NOT_MET: "Minimum order amount not met",
          COUPON_USAGE_LIMIT_REACHED: "Coupon usage limit reached",
          COUPON_ALREADY_USED: "You have already used this coupon",
        };

        const message = errorMessages[error.message] || error.message;

        return res.status(400).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to validate coupon",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, startDate, endDate, isActive } = req.body;

      if (discountType && !["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"].includes(discountType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      const coupon = await couponService.update(id, {
        code: code?.trim(),
        discountType,
        discountValue: discountValue !== undefined ? parseFloat(discountValue) : undefined,
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : undefined,
        maxDiscount: maxDiscount !== undefined ? parseFloat(maxDiscount) : undefined,
        usageLimit: usageLimit !== undefined ? parseInt(usageLimit) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Coupon updated successfully",
        data: coupon,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COUPON_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      if (error instanceof Error && error.message === "COUPON_CODE_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update coupon",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      await couponService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COUPON_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Coupon not found",
        });
      }

      if (error instanceof Error && error.message === "COUPON_HAS_USAGE") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete coupon with usage history",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete coupon",
      });
    }
  },
};