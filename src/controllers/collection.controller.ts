import { Request, Response } from "express";
import { collectionService } from "../services/collection.service";

export const collectionController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, description, isActive, startDate, endDate } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Collection name is required",
        });
      }

      const collection = await collectionService.create({
        name: name.trim(),
        description,
        isActive: isActive !== undefined ? isActive === "true" : true,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        image: req.file,
      });

      return res.status(201).json({
        success: true,
        message: "Collection created successfully",
        data: collection,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COLLECTION_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Collection already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create collection",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === "true";

      const collections = await collectionService.getAll(includeInactive);

      return res.status(200).json({
        success: true,
        data: collections,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch collections",
      });
    }
  },

  getBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    try {
      const slug: string = req.params.slug;

      const collection = await collectionService.getBySlug(slug);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: collection,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch collection",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const collection = await collectionService.getById(id);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: collection,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch collection",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const { name, description, isActive, startDate, endDate } = req.body;

      const collection = await collectionService.update(id, {
        name: name?.trim(),
        description,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        image: req.file,
      });

      return res.status(200).json({
        success: true,
        message: "Collection updated successfully",
        data: collection,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      if (error instanceof Error && error.message === "COLLECTION_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Collection already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update collection",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      await collectionService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Collection deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete collection",
      });
    }
  },

  addProduct: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const collectionId: string = req.params.id;
      const { productId, sortOrder } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const result = await collectionService.addProduct(collectionId, productId, sortOrder ?? 0);

      return res.status(201).json({
        success: true,
        message: "Product added to collection successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
        });
      }

      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error instanceof Error && error.message === "PRODUCT_ALREADY_IN_COLLECTION") {
        return res.status(409).json({
          success: false,
          message: "Product already in collection",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to add product to collection",
      });
    }
  },

  removeProduct: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const collectionId: string = req.params.id;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      await collectionService.removeProduct(collectionId, productId);

      return res.status(200).json({
        success: true,
        message: "Product removed from collection successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_IN_COLLECTION") {
        return res.status(404).json({
          success: false,
          message: "Product not in collection",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to remove product from collection",
      });
    }
  },

  updateProductSortOrder: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const collectionId: string = req.params.id;
      const { productId, sortOrder } = req.body;

      if (!productId || sortOrder === undefined) {
        return res.status(400).json({
          success: false,
          message: "Product ID and sort order are required",
        });
      }

      const result = await collectionService.updateProductSortOrder(collectionId, productId, sortOrder);

      return res.status(200).json({
        success: true,
        message: "Product sort order updated successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_IN_COLLECTION") {
        return res.status(404).json({
          success: false,
          message: "Product not in collection",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update product sort order",
      });
    }
  },
};