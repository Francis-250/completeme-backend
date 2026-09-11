import { Request, Response } from "express";
import { brandService } from "../services/brand.service";

export const brandController = {
  create: async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Brand name is required",
        });
      }

      const brand = await brandService.create({
        name: name.trim(),
        description,
        logo: req.file,
      });

      return res.status(201).json({
        success: true,
        message: "Brand created successfully",
        data: brand,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "BRAND_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Brand already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create brand",
      });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const brands = await brandService.getAll();

      return res.status(200).json({
        success: true,
        data: brands,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch brands",
      });
    }
  },

  getBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    try {
      const slug: string = req.params.slug;

      const brand = await brandService.getBySlug(slug);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: brand,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch brand",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const { name, description } = req.body;

      const brand = await brandService.update(id, {
        name: name?.trim(),
        description,
        logo: req.file,
      });

      return res.status(200).json({
        success: true,
        message: "Brand updated successfully",
        data: brand,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "BRAND_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      if (error instanceof Error && error.message === "BRAND_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Brand already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update brand",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      await brandService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Brand deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "BRAND_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Brand not found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete brand",
      });
    }
  },
};
