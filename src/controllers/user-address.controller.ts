import { Request, Response } from "express";
import { userAddressService } from "../services/user-address.service";

export const userAddressController = {
  create: async (req: Request, res: Response) => {
    try {
      const { addressType, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

      if (!addressType || !addressLine1 || !city || !state || !postalCode || !country) {
        return res.status(400).json({
          success: false,
          message: "All required address fields must be provided",
        });
      }

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const address = await userAddressService.create(userId, {
        addressType,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
      });

      return res.status(201).json({
        success: true,
        message: "Address created successfully",
        data: address,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create address",
      });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const addresses = await userAddressService.getAll(userId);

      return res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch addresses",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const address = await userAddressService.getById(id, userId);

      return res.status(200).json({
        success: true,
        data: address,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Address not found",
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
        message: "Failed to fetch address",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const { addressType, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const address = await userAddressService.update(id, userId, {
        addressType,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
      });

      return res.status(200).json({
        success: true,
        message: "Address updated successfully",
        data: address,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Address not found",
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
        message: "Failed to update address",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      await userAddressService.delete(id, userId);

      return res.status(200).json({
        success: true,
        message: "Address deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      if (error instanceof Error && error.message === "FORBIDDEN") {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      if (error instanceof Error && error.message === "ADDRESS_USED_IN_ORDERS") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete address used in orders",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to delete address",
      });
    }
  },

  setDefault: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id: string = req.params.id;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const address = await userAddressService.setDefault(id, userId);

      return res.status(200).json({
        success: true,
        message: "Default address updated successfully",
        data: address,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Address not found",
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
        message: "Failed to set default address",
      });
    }
  },
};