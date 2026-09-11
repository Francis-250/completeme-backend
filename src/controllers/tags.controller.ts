import { Request, Response } from "express";
import { tagService } from "../services/tags.service";

export const tagController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tag name is required",
        });
      }

      const tag = await tagService.create({
        name: name.trim(),
      });

      return res.status(201).json({
        success: true,
        message: "Tag created successfully",
        data: tag,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "TAG_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Tag already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create tag",
      });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const tags = await tagService.getAll();

      return res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tags",
      });
    }
  },

  getBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    try {
      const slug: string = req.params.slug;

      const tag = await tagService.getBySlug(slug);

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tag",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const tag = await tagService.getById(id);

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tag",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const { name } = req.body;

      const tag = await tagService.update(id, {
        name: name?.trim(),
      });

      return res.status(200).json({
        success: true,
        message: "Tag updated successfully",
        data: tag,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "TAG_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      if (error instanceof Error && error.message === "TAG_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Tag already exists",
        });
      }

      if (error instanceof Error && error.message === "TAG_HAS_PRODUCTS") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete tag with products",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update tag",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      await tagService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Tag deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "TAG_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Tag not found",
        });
      }

      if (error instanceof Error && error.message === "TAG_HAS_PRODUCTS") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete tag with products",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete tag",
      });
    }
  },
};