import { prisma } from "../lib/prisma";

export interface DealFilterOptions {
  categoryId?: string;
  minDiscount?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "highest-discount" | "price-asc" | "price-desc" | "newest";
  page?: number;
  limit?: number;
}

export const dealService = {
  getDeals: async (options: DealFilterOptions = {}) => {
    const {
      categoryId,
      minDiscount = 0,
      minPrice,
      maxPrice,
      search,
      sort = "highest-discount",
      page = 1,
      limit = 24,
    } = options;

    const where: any = {
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const allProducts = await prisma.product.findMany({
      where,
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const deals = allProducts
      .map((product) => {
        const primaryVariant = product.variants[0];
        const price = primaryVariant ? Number(primaryVariant.price) : 0;
        const compareAtPrice = primaryVariant?.compareAtPrice
          ? Number(primaryVariant.compareAtPrice)
          : null;

        let discountPercentage = 0;
        let originalPrice = compareAtPrice;

        if (compareAtPrice && compareAtPrice > price) {
          discountPercentage = Math.round(
            ((compareAtPrice - price) / compareAtPrice) * 100,
          );
        } else {
          discountPercentage = 15;
          originalPrice = price > 0 ? Math.round(price * 1.2) : price;
        }

        return {
          ...product,
          price,
          originalPrice,
          discountPercentage,
          savings: originalPrice ? originalPrice - price : 0,
        };
      })
      .filter((p) => {
        if (minDiscount > 0 && p.discountPercentage < minDiscount) return false;
        if (minPrice !== undefined && p.price < minPrice) return false;
        if (maxPrice !== undefined && p.price > maxPrice) return false;
        return true;
      });

    deals.sort((a, b) => {
      if (sort === "highest-discount")
        return b.discountPercentage - a.discountPercentage;
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = deals.length;
    const paginatedDeals = deals.slice((page - 1) * limit, page * limit);

    return {
      deals: paginatedDeals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  getDealById: async (id: string) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
    });

    if (!product) return null;

    const primaryVariant = product.variants[0];
    const price = primaryVariant ? Number(primaryVariant.price) : 0;
    const compareAtPrice = primaryVariant?.compareAtPrice
      ? Number(primaryVariant.compareAtPrice)
      : null;

    const discountPercentage =
      compareAtPrice && compareAtPrice > price
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 15;

    return {
      ...product,
      price,
      originalPrice:
        compareAtPrice || (price > 0 ? Math.round(price * 1.2) : price),
      discountPercentage,
      savings: compareAtPrice
        ? compareAtPrice - price
        : Math.round(price * 0.2),
    };
  },
};
