import { Request, Response } from "express";
import { profileService } from "../services/profile.service";

export const profileController = {
  get: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const profile = await profileService.getProfile(userId);
      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const updated = await profileService.updateProfile(userId, req.body);
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  },
};
