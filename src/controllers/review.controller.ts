import { Request, Response } from "express";
import { reviewService } from "../services/review.service";

export const reviewController = {
  create: async (req: Request, res: Response) => {
    try {
      const { productId, rating, title, comment } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const review = await reviewService.create(userId, {
        productId,
        rating: parseInt(rating),
        title,
        comment,
      });

      return res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error instanceof Error && error.message === "REVIEW_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "You have already reviewed this product",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create review",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const { productId, userId, isApproved, page, limit } = req.query;

      const filters: Record<string, unknown> = {};

      if (productId) filters.productId = productId as string;
      if (userId) filters.userId = userId as string;
      if (isApproved !== undefined) filters.isApproved = isApproved === "true";
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      // Non-admin users only see approved reviews
      if (req.user?.role !== "ADMIN") {
        filters.isApproved = true;
      }

      const result = await reviewService.getAll(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reviews",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const review = await reviewService.getById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch review",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const { rating, title, comment, isApproved } = req.body;

      const userId = req.user?.id;
      const isAdmin = req.user?.role === "ADMIN";

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const review = await reviewService.update(id, userId, {
        rating: rating !== undefined ? parseInt(rating) : undefined,
        title,
        comment,
        isApproved: isAdmin ? (isApproved === "true" ? true : isApproved === "false" ? false : undefined) : undefined,
      }, isAdmin);

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "REVIEW_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      if (error instanceof Error && error.message === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update review",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "ADMIN";

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await reviewService.delete(id, userId, isAdmin);

      return res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "REVIEW_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      if (error instanceof Error && error.message === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete review",
      });
    }
  },
};