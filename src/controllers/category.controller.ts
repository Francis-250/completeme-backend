import { Request, Response } from "express";
import { categoryService } from "../services/category.service";

export const categoryController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, description, parentId, imageUrl } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const category = await categoryService.create({
        name: name.trim(),
        description,
        parentId,
        image: req.file,
        imageUrl,
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CATEGORY_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }

      if (error instanceof Error && error.message === "PARENT_CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create category",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const includeChildren = req.query.includeChildren === "true";

      const categories = await categoryService.getAll(includeChildren);

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }
  },

  getBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    try {
      const slug: string = req.params.slug;

      const category = await categoryService.getBySlug(slug);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch category",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const category = await categoryService.getById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch category",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const { name, description, parentId, imageUrl } = req.body;

      const category = await categoryService.update(id, {
        name: name?.trim(),
        description,
        parentId,
        image: req.file,
        imageUrl,
      });

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (error instanceof Error && error.message === "CATEGORY_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }

      if (error instanceof Error && error.message === "PARENT_CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }

      if (error instanceof Error && error.message === "CANNOT_BE_OWN_PARENT") {
        return res.status(400).json({
          success: false,
          message: "Category cannot be its own parent",
        });
      }

      if (error instanceof Error && error.message === "CATEGORY_HAS_CHILDREN") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with children",
        });
      }

      if (error instanceof Error && error.message === "CATEGORY_HAS_PRODUCTS") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with products",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update category",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      await categoryService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (error instanceof Error && error.message === "CATEGORY_HAS_CHILDREN") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with children",
        });
      }

      if (error instanceof Error && error.message === "CATEGORY_HAS_PRODUCTS") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete category with products",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete category",
      });
    }
  },
};