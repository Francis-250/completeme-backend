import { Request, Response } from "express";
import { newsletterService } from "../services/newsletter.service";

export const newsletterController = {
  subscribe: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const subscriber = await newsletterService.subscribe(email);
      return res.status(200).json({
        success: true,
        message: "Subscribed successfully to the newsletter",
        data: subscriber,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_EMAIL") {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to subscribe to newsletter",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const { page, limit, activeOnly } = req.query;
      const result = await newsletterService.getAll({
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
        activeOnly: activeOnly === "true",
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch newsletter subscribers",
      });
    }
  },

  unsubscribe: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      await newsletterService.unsubscribe(email);
      return res.status(200).json({
        success: true,
        message: "Unsubscribed successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "SUBSCRIBER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Subscriber not found",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to unsubscribe",
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await newsletterService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Subscriber deleted successfully",
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to delete subscriber",
      });
    }
  },
};
