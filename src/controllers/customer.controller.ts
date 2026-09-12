import { Request, Response } from "express";
import { customerService } from "../services/customer.service";

export const customerController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { search, limit } = req.query;
      const customers = await customerService.getAll({
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch customers",
      });
    }
  },

  getById: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const customer = await customerService.getById(req.params.id);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer",
      });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, name, email, phone, address, isActive } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const customer = await customerService.create({
        firstName,
        lastName,
        name,
        email,
        phone,
        address,
        isActive,
      });

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error: any) {
      console.error("Failed to create customer:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to create customer",
      });
    }
  },

  update: async (req: Request<{ id: string }>, res: Response) => {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error: any) {
      console.error("Failed to update customer:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to update customer",
      });
    }
  },

  delete: async (req: Request<{ id: string }>, res: Response) => {
    try {
      await customerService.delete(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error: any) {
      console.error("Failed to delete customer:", error);
      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to delete customer",
      });
    }
  },
};
