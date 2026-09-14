import { Request, Response } from "express";
import { blogService } from "../services/blog.service";

export const blogController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { category, search, page, limit } = req.query;

      const result = await blogService.getAll({
        category: category as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch blog posts",
      });
    }
  },

  getBySlug: async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug as string;
      const post = await blogService.getBySlug(slug);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch blog post",
      });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const post = await blogService.getById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Blog post not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch blog post",
      });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const post = await blogService.create(req.body);
      return res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create blog post",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const post = await blogService.update(id, req.body);
      return res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update blog post",
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await blogService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Blog post deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete blog post",
      });
    }
  },
};
