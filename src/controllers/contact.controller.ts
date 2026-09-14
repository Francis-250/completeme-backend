import { Request, Response } from "express";
import { contactService } from "../services/contact.service";

export const contactController = {
  createInquiry: async (req: Request, res: Response) => {
    try {
      const inquiry = await contactService.createInquiry(req.body);
      return res.status(201).json({
        success: true,
        data: inquiry,
        message: "Your inquiry has been submitted successfully.",
      });
    } catch (error: any) {
      const status = error.message === "NAME_EMAIL_MESSAGE_REQUIRED" ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || "Failed to submit inquiry",
      });
    }
  },

  getAllInquiries: async (req: Request, res: Response) => {
    try {
      const { status, page, limit } = req.query;
      const result = await contactService.getAllInquiries({
        status: status as string,
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
        message: error.message || "Failed to fetch inquiries",
      });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updated = await contactService.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update inquiry status",
      });
    }
  },
};
