import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { prisma } from "../lib/prisma";

export const productController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, description, shortDescription, metaTitle, metaDescription, categoryId, brandId, isActive, variants } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name is required",
        });
      }

      if (!variants || !Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one variant is required",
        });
      }

      const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : (req.body.vendorId || undefined);

      const product = await productService.create({
        name: name.trim(),
        description,
        shortDescription,
        metaTitle,
        metaDescription,
        categoryId,
        brandId,
        vendorId,
        isActive: isActive !== undefined ? (typeof isActive === "boolean" ? isActive : isActive === "true") : true,
        images: req.files as Express.Multer.File[],
        imageUrls: req.body.images && Array.isArray(req.body.images) ? req.body.images : undefined,
        variants: parsedVariants,
      }, vendorId);

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Product already exists",
        });
      }

      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (error instanceof Error && error.message === "BRAND_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      if (error instanceof Error && error.message === "VENDOR_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
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
        message: "Failed to create product",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const { categoryId, brandId, vendorId, isActive, search, page, limit } = req.query;

      const filters: Record<string, unknown> = {};

      if (categoryId) filters.categoryId = categoryId as string;
      if (brandId) filters.brandId = brandId as string;
      if (vendorId) filters.vendorId = vendorId as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      if (search) filters.search = search as string;
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      // If user is vendor, only show their products
      if (req.user?.role === "VENDOR") {
        const vendorProfile = await prisma.vendorProfile.findUnique({
          where: { userId: req.user.id },
        });

        if (vendorProfile) {
          filters.vendorId = vendorProfile.id;
        }
      }

      const result = await productService.getAll(filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  },

  getBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    try {
      const slug: string = req.params.slug;

      const product = await productService.getBySlug(slug);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const product = await productService.getById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const { name, description, shortDescription, metaTitle, metaDescription, categoryId, brandId, isActive, variants, vendorId: bodyVendorId } = req.body;

      const parsedVariants = variants ? (typeof variants === "string" ? JSON.parse(variants) : variants) : undefined;

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : undefined;

      const product = await productService.update(id, {
        name: name?.trim(),
        description,
        shortDescription,
        metaTitle,
        metaDescription,
        categoryId,
        brandId,
        vendorId: bodyVendorId !== undefined ? (bodyVendorId || null) : undefined,
        isActive: isActive !== undefined ? (typeof isActive === "boolean" ? isActive : isActive === "true") : undefined,
        images: req.files as Express.Multer.File[],
        imageUrls: req.body.images && Array.isArray(req.body.images) ? req.body.images : undefined,
        variants: parsedVariants,
      }, vendorId);

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error instanceof Error && error.message === "PRODUCT_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Product already exists",
        });
      }

      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (error instanceof Error && error.message === "BRAND_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
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
        message: "Failed to update product",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : undefined;

      await productService.delete(id, vendorId);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
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
        message: "Failed to delete product",
      });
    }
  },

  // Variant endpoints
  createVariant: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const productId: string = req.params.id;

      const { sku, price, compareAtPrice, stockQuantity, weight, attributes } = req.body;

      if (!sku?.trim() || price === undefined || stockQuantity === undefined) {
        return res.status(400).json({
          success: false,
          message: "SKU, price, and stock quantity are required",
        });
      }

      const parsedAttributes = attributes ? (typeof attributes === "string" ? JSON.parse(attributes) : attributes) : {};

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : undefined;

      const variant = await productService.createVariant(productId, {
        sku: sku.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        stockQuantity: parseInt(stockQuantity),
        weight: weight ? parseFloat(weight) : undefined,
        attributes: parsedAttributes,
        images: req.files as Express.Multer.File[],
      }, vendorId);

      return res.status(201).json({
        success: true,
        message: "Variant created successfully",
        data: variant,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error instanceof Error && error.message === "VARIANT_SKU_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Variant SKU already exists",
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
        message: "Failed to create variant",
      });
    }
  },

  updateVariant: async (req: Request<{ variantId: string }>, res: Response) => {
    try {
      const variantId: string = req.params.variantId;

      const { sku, price, compareAtPrice, stockQuantity, weight, attributes } = req.body;

      const parsedAttributes = attributes ? (typeof attributes === "string" ? JSON.parse(attributes) : attributes) : undefined;

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : undefined;

      const variant = await productService.updateVariant(variantId, {
        sku: sku?.trim(),
        price: price !== undefined ? parseFloat(price) : undefined,
        compareAtPrice: compareAtPrice !== undefined ? parseFloat(compareAtPrice) : undefined,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        weight: weight !== undefined ? parseFloat(weight) : undefined,
        attributes: parsedAttributes,
        images: req.files as Express.Multer.File[],
      }, vendorId);

      return res.status(200).json({
        success: true,
        message: "Variant updated successfully",
        data: variant,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      if (error instanceof Error && error.message === "VARIANT_SKU_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Variant SKU already exists",
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
        message: "Failed to update variant",
      });
    }
  },

  deleteVariant: async (req: Request<{ variantId: string }>, res: Response) => {
    try {
      const variantId: string = req.params.variantId;

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : undefined;

      await productService.deleteVariant(variantId, vendorId);

      return res.status(200).json({
        success: true,
        message: "Variant deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VARIANT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
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
        message: "Failed to delete variant",
      });
    }
  },

  addTag: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const productId: string = req.params.id;
      const { tagId } = req.body;

      if (!tagId) {
        return res.status(400).json({
          success: false,
          message: "Tag ID is required",
        });
      }

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : undefined;

      await productService.addTag(productId, tagId, vendorId);

      return res.status(201).json({
        success: true,
        message: "Tag added to product successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error instanceof Error && error.message === "TAG_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      if (error instanceof Error && error.message === "TAG_ALREADY_ADDED") {
        return res.status(409).json({
          success: false,
          message: "Tag already added to product",
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
        message: "Failed to add tag to product",
      });
    }
  },

  removeTag: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const productId: string = req.params.id;
      const { tagId } = req.body;

      if (!tagId) {
        return res.status(400).json({
          success: false,
          message: "Tag ID is required",
        });
      }

      const vendorId = req.user?.role === "VENDOR" ? req.user.id : undefined;

      await productService.removeTag(productId, tagId, vendorId);

      return res.status(200).json({
        success: true,
        message: "Tag removed from product successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (error instanceof Error && error.message === "TAG_NOT_ON_PRODUCT") {
        return res.status(404).json({
          success: false,
          message: "Tag not on product",
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
        message: "Failed to remove tag from product",
      });
    }
  },
};