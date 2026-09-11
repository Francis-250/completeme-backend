import { Request, Response } from "express";
import { shipmentService } from "../services/shipment.service";
import { prisma } from "../lib/prisma";

export const shipmentController = {
  create: async (req: Request, res: Response) => {
    try {
      const { orderId, carrier, trackingNumber, status, estimatedDelivery, shippedAt, deliveredAt } = req.body;

      if (!orderId || !carrier || !trackingNumber) {
        return res.status(400).json({
          success: false,
          message: "Order ID, carrier, and tracking number are required",
        });
      }

      if (status && !["LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shipment status",
        });
      }

      const shipment = await shipmentService.create({
        orderId,
        carrier,
        trackingNumber,
        status,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        shippedAt: shippedAt ? new Date(shippedAt) : undefined,
        deliveredAt: deliveredAt ? new Date(deliveredAt) : undefined,
      });

      return res.status(201).json({
        success: true,
        message: "Shipment created successfully",
        data: shipment,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (error instanceof Error && error.message === "TRACKING_NUMBER_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Tracking number already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create shipment",
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

      // Non-admin users can only see shipments for their orders
      if (!isAdmin && req.user?.id) {
        const userOrders = await prisma.order.findMany({
          where: { userId: req.user.id },
          select: { id: true },
        });
        const orderIds = userOrders.map((o) => o.id);
        filters.orderId = { in: orderIds };
      }

      const result = await shipmentService.getAll(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch shipments",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const isAdmin = req.user?.role === "ADMIN";

      const shipment = await shipmentService.getById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      if (!isAdmin && shipment.order.userId !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return res.status(200).json({
        success: true,
        data: shipment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch shipment",
      });
    }
  },

  getByTrackingNumber: async (req: Request<{ trackingNumber: string }>, res: Response) => {
    try {
      const trackingNumber: string = req.params.trackingNumber;
      const isAdmin = req.user?.role === "ADMIN";

      const shipment = await shipmentService.getByTrackingNumber(trackingNumber);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      if (!isAdmin && shipment.order.userId !== req.user?.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return res.status(200).json({
        success: true,
        data: shipment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch shipment",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const { carrier, trackingNumber, status, estimatedDelivery, shippedAt, deliveredAt } = req.body;

      if (status && !["LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shipment status",
        });
      }

      const shipment = await shipmentService.update(id, {
        carrier,
        trackingNumber,
        status,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        shippedAt: shippedAt ? new Date(shippedAt) : undefined,
        deliveredAt: deliveredAt ? new Date(deliveredAt) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Shipment updated successfully",
        data: shipment,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "SHIPMENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      if (error instanceof Error && error.message === "TRACKING_NUMBER_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Tracking number already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update shipment",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      await shipmentService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Shipment deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "SHIPMENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete shipment",
      });
    }
  },
};