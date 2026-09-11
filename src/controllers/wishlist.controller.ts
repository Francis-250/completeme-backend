import { Request, Response } from "express";
import { wishlistService } from "../services/wishlist.service";

export const wishlistController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const wishlist = await wishlistService.getAll(userId);

      return res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch wishlist",
      });
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const wishlistItem = await wishlistService.add(userId, { productId });

      return res.status(201).json({
        success: true,
        message: "Product added to wishlist successfully",
        data: wishlistItem,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error instanceof Error && error.message === "PRODUCT_ALREADY_IN_WISHLIST") {
        return res.status(409).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to add product to wishlist",
      });
    }
  },

  remove: async (req: Request<{ productId: string }>, res: Response) => {
    try {
      const productId: string = req.params.productId;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await wishlistService.remove(userId, productId);

      return res.status(200).json({
        success: true,
        message: "Product removed from wishlist successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_IN_WISHLIST") {
        return res.status(404).json({
          success: false,
          message: "Product not in wishlist",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to remove product from wishlist",
      });
    }
  },

  check: async (req: Request<{ productId: string }>, res: Response) => {
    try {
      const productId: string = req.params.productId;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const inWishlist = await wishlistService.check(userId, productId);

      return res.status(200).json({
        success: true,
        data: { inWishlist },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to check wishlist",
      });
    }
  },

  clear: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await wishlistService.clear(userId);

      return res.status(200).json({
        success: true,
        message: "Wishlist cleared successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to clear wishlist",
      });
    }
  },
};