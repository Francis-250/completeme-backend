import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { prisma } from "../lib/prisma";

export const paymentController = {
  create: async (req: Request, res: Response) => {
    try {
      const { orderId, paymentMethod, transactionId, amount, status } = req.body;

      if (!orderId || !paymentMethod || !transactionId || amount === undefined || !status) {
        return res.status(400).json({
          success: false,
          message: "Order ID, payment method, transaction ID, amount, and status are required",
        });
      }

      if (!["COMPLETED", "FAILED", "REFUNDED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      const payment = await paymentService.create({
        orderId,
        paymentMethod,
        transactionId,
        amount: parseFloat(amount),
        status,
      });

      return res.status(201).json({
        success: true,
        message: "Payment recorded successfully",
        data: payment,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (error instanceof Error && error.message === "TRANSACTION_ID_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Transaction ID already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to record payment",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const { orderId, status, page, limit } = req.query;
      const isAdmin = req.user?.role === "ADMIN";

      const filters: Record<string, unknown> = {};

      if (orderId) filters.orderId = orderId as string;
      if (status) filters.status = status as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      // Non-admin users can only see payments for their orders
      if (!isAdmin && req.user?.id) {
        const userOrders = await prisma.order.findMany({
          where: { userId: req.user.id },
          select: { id: true },
        });
        const orderIds = userOrders.map((o) => o.id);
        filters.orderId = { in: orderIds };
      }

      const result = await paymentService.getAll(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const isAdmin = req.user?.role === "ADMIN";

      const payment = await paymentService.getById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Non-admin users can only see payments for their orders
      if (!isAdmin && payment.order.userId !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment",
      });
    }
  },

  getByTransactionId: async (req: Request<{ transactionId: string }>, res: Response) => {
    try {
      const transactionId: string = req.params.transactionId;
      const isAdmin = req.user?.role === "ADMIN";

      const payment = await paymentService.getByTransactionId(transactionId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      if (!isAdmin && payment.order.userId !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const { status } = req.body;

      if (!status || !["COMPLETED", "FAILED", "REFUNDED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Valid status is required",
        });
      }

      const payment = await paymentService.update(id, { status });

      return res.status(200).json({
        success: true,
        message: "Payment updated successfully",
        data: payment,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PAYMENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update payment",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      await paymentService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Payment deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PAYMENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      if (error instanceof Error && error.message === "CANNOT_DELETE_COMPLETED_PAYMENT") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete completed or refunded payment",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete payment",
      });
    }
  },
};