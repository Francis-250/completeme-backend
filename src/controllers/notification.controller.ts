import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const unreadOnly = req.query.unread === "true";
      const type = req.query.type as string | undefined;

      const result = await notificationService.getAll({ limit, unreadOnly, type });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Failed to get notifications:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get notifications",
      });
    }
  },

  markAsRead: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await notificationService.markAsRead(id);
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }
  },

  markAllAsRead: async (_req: Request, res: Response) => {
    try {
      await notificationService.markAllAsRead();
      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      await notificationService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }
  },

  deleteAll: async (_req: Request, res: Response) => {
    try {
      await notificationService.deleteAll();
      return res.status(200).json({
        success: true,
        message: "All notifications cleared",
      });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to clear notifications",
      });
    }
  },
};
