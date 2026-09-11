import { Request, Response } from "express";
import { cartService } from "../services/cart.service";

export const cartController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const cartItems = await cartService.getAll(userId);

      return res.status(200).json({
        success: true,
        data: cartItems,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart",
      });
    }
  },

  getSummary: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const summary = await cartService.getSummary(userId);

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cart summary",
      });
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const { variantId, quantity } = req.body;

      if (!variantId || !quantity) {
        return res.status(400).json({
          success: false,
          message: "Variant ID and quantity are required",
        });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const cartItem = await cartService.add(userId, {
        variantId,
        quantity: parseInt(quantity),
      });

      return res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: cartItem,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      if (error instanceof Error && error.message === "PRODUCT_NOT_ACTIVE") {
        return res.status(400).json({
          success: false,
          message: "Product is not active",
        });
      }

      if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to add item to cart",
      });
    }
  },

  update: async (req: Request<{ variantId: string }>, res: Response) => {
    try {
      const variantId: string = req.params.variantId;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required",
        });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const cartItem = await cartService.update(userId, variantId, {
        quantity: parseInt(quantity),
      });

      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: cartItem,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      if (error instanceof Error && error.message === "CART_ITEM_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update cart",
      });
    }
  },

  remove: async (req: Request<{ variantId: string }>, res: Response) => {
    try {
      const variantId: string = req.params.variantId;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await cartService.remove(userId, variantId);

      return res.status(200).json({
        success: true,
        message: "Item removed from cart successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CART_ITEM_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to remove item from cart",
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

      await cartService.clear(userId);

      return res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to clear cart",
      });
    }
  },
};