import { Request, Response } from "express";
import { settingsService } from "../services/settings.service";

export const settingsController = {
  get: async (_req: Request, res: Response) => {
    try {
      const settings = await settingsService.getSettings();
      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch settings",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const updated = await settingsService.updateSettings(req.body);
      return res.status(200).json({
        success: true,
        message: "Settings saved successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update settings",
      });
    }
  },
};
