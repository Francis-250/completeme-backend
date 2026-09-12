import { Request, Response } from "express";
import { orderService } from "../services/order.service";

export const orderController = {
  create: async (req: Request, res: Response) => {
    try {
      const { items, couponId, taxAmount, shippingAmount, discountAmount, status, shippingAddressId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const parsedItems = items ? (typeof items === "string" ? JSON.parse(items) : items) : undefined;

      const order = await orderService.create(userId, {
        items: parsedItems,
        couponId,
        taxAmount: taxAmount ? parseFloat(taxAmount) : undefined,
        shippingAmount: shippingAmount ? parseFloat(shippingAmount) : undefined,
        discountAmount: discountAmount ? parseFloat(discountAmount) : undefined,
        status,
        shippingAddressId,
      });

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      if (error instanceof Error) {
        const errorMessages: Record<string, string> = {
          CART_EMPTY: "Cart is empty",
          VARIANT_NOT_FOUND: "Product variant not found",
          PRODUCT_NOT_ACTIVE: "Product is not active",
          INSUFFICIENT_STOCK: "Insufficient stock",
          COUPON_NOT_FOUND: "Coupon not found",
          COUPON_EXPIRED: "Coupon has expired",
          COUPON_USAGE_LIMIT_REACHED: "Coupon usage limit reached",
          MIN_ORDER_AMOUNT_NOT_MET: "Minimum order amount not met",
          COUPON_ALREADY_USED: "You have already used this coupon",
          INVALID_SHIPPING_ADDRESS: "Invalid shipping address",
        };

        const message = errorMessages[error.message.split(":")[0]] || error.message;

        return res.status(400).json({
          success: false,
          message,
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create order",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const { status, page, limit } = req.query;
      const userId = req.user?.id;
      const role = (req.user?.role || "").toUpperCase();
      const isAdmin = role === "ADMIN";

      const filters: Record<string, unknown> = {};

      if (status && status !== "all") {
        filters.status = (status as string).toUpperCase();
      }
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      // Non-admin users only see their own orders if user ID is present
      if (!isAdmin && userId) {
        filters.userId = userId;
      }

      const result = await orderService.getAll(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "ADMIN";

      if (!userId && !isAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const order = await orderService.getById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Non-admin users can only see their own orders
      if (!isAdmin && order.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch order",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const { status, shippingAddressId } = req.body;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "ADMIN";

      if (!userId && !isAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const order = await orderService.update(id, {
        status,
        shippingAddressId,
      }, userId, isAdmin);

      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
        data: order,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (error instanceof Error && error.message === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      if (error instanceof Error && error.message === "INVALID_STATUS_TRANSITION") {
        return res.status(400).json({
          success: false,
          message: "Invalid status transition",
        });
      }

      if (error instanceof Error && error.message === "INVALID_SHIPPING_ADDRESS") {
        return res.status(400).json({
          success: false,
          message: "Invalid shipping address",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update order",
      });
    }
  },

  cancel: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "ADMIN";

      if (!userId && !isAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const order = await orderService.cancel(id, userId, isAdmin);

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (error instanceof Error && error.message === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      if (error instanceof Error && error.message === "INVALID_STATUS_TRANSITION") {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel order in current status",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to cancel order",
      });
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "ADMIN";

      const stats = await orderService.getStats(isAdmin ? undefined : userId);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch order stats",
      });
    }
  },
};