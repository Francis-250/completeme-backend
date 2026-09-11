import { Request, Response } from "express";
import { mediaService } from "../services/media.service";

export const mediaController = {
  getMedia: async (req: Request, res: Response) => {
    try {
      const { folder, next_cursor, limit, search } = req.query;

      const result = await mediaService.getMedia({
        folder: folder as string,
        next_cursor: next_cursor as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        search: search as string,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Failed to fetch media:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch media resources",
      });
    }
  },

  getFolders: async (_req: Request, res: Response) => {
    try {
      const folders = await mediaService.getFolders();
      return res.status(200).json({
        success: true,
        data: folders,
      });
    } catch (error) {
      console.error("Failed to fetch media folders:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch media folders",
      });
    }
  },

  uploadMedia: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const folder = (req.body.folder as string) || "uploads";
      const uploaded = await mediaService.upload(req.file, folder);

      return res.status(201).json({
        success: true,
        message: "Media uploaded successfully",
        data: uploaded,
      });
    } catch (error) {
      console.error("Failed to upload media:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload media",
      });
    }
  },

  deleteMedia: async (req: Request, res: Response) => {
    try {
      const publicId =
        (req.params as any).publicId ||
        (req.query.public_id as string) ||
        req.body.public_id;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "public_id is required",
        });
      }

      await mediaService.delete(publicId);

      return res.status(200).json({
        success: true,
        message: "Media deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete media:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete media",
      });
    }
  },
};
