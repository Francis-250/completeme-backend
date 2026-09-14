import { Request, Response } from "express";
import { dealService } from "../services/deal.service";

export const dealController = {
  getDeals: async (req: Request, res: Response) => {
    try {
      const {
        categoryId,
        minDiscount,
        minPrice,
        maxPrice,
        search,
        sort,
        page,
        limit,
      } = req.query;

      const result = await dealService.getDeals({
        categoryId: categoryId as string,
        minDiscount: minDiscount ? Number(minDiscount) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: search as string,
        sort: sort as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 24,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch deals",
      });
    }
  },

  getDealById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const deal = await dealService.getDealById(id);

      if (!deal) {
        return res.status(404).json({
          success: false,
          message: "Deal product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: deal,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch deal",
      });
    }
  },
};
