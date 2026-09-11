import { Request, Response } from "express";
import { vendorProfileService } from "../services/vendor-profile.service";

export const vendorProfileController = {
  create: async (req: Request, res: Response) => {
    try {
      const { userId, companyName, description, isActive } = req.body;

      if (!companyName?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Company name is required",
        });
      }

      const targetUserId = userId || req.user?.id;

      if (!targetUserId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Check if user already has vendor profile
      if (req.user?.role !== "ADMIN" && targetUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const vendorProfile = await vendorProfileService.create({
        userId: targetUserId,
        companyName: companyName.trim(),
        description,
        isActive: isActive !== undefined ? isActive === "true" : true,
        logo: req.file,
      });

      return res.status(201).json({
        success: true,
        message: "Vendor profile created successfully",
        data: vendorProfile,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VENDOR_PROFILE_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "User already has a vendor profile",
        });
      }

      if (error instanceof Error && error.message === "VENDOR_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Vendor with this name already exists",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create vendor profile",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === "true";

      const vendorProfiles = await vendorProfileService.getAll(includeInactive);

      return res.status(200).json({
        success: true,
        data: vendorProfiles,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendor profiles",
      });
    }
  },

  getBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    try {
      const slug: string = req.params.slug;

      const vendorProfile = await vendorProfileService.getBySlug(slug);

      if (!vendorProfile) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: vendorProfile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendor profile",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;

      const vendorProfile = await vendorProfileService.getById(id);

      if (!vendorProfile) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: vendorProfile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendor profile",
      });
    }
  },

  getMyProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const vendorProfile = await vendorProfileService.getByUserId(userId);

      if (!vendorProfile) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: vendorProfile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendor profile",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const { companyName, description, isActive } = req.body;
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "ADMIN";

      if (!userId && !isAdmin) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const vendorProfile = await vendorProfileService.update(id, {
        companyName: companyName?.trim(),
        description,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        logo: req.file,
      }, userId, isAdmin);

      return res.status(200).json({
        success: true,
        message: "Vendor profile updated successfully",
        data: vendorProfile,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VENDOR_PROFILE_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found",
        });
      }

      if (error instanceof Error && error.message === "VENDOR_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Vendor with this name already exists",
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
        message: "Failed to update vendor profile",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const isAdmin = req.user?.role === "ADMIN";

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      await vendorProfileService.delete(id, isAdmin);

      return res.status(200).json({
        success: true,
        message: "Vendor profile deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "VENDOR_PROFILE_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found",
        });
      }

      if (error instanceof Error && error.message === "VENDOR_HAS_PRODUCTS") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete vendor with products",
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
        message: "Failed to delete vendor profile",
      });
    }
  },
};