import { CreateProductReviewData, UpdateProductReviewData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";

export const reviewService = {
  create: async (userId: string, data: CreateProductReviewData) => {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId: data.productId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new Error("REVIEW_ALREADY_EXISTS");
    }

    // Check if user purchased this product (optional business logic)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        order: {
          userId,
          status: "DELIVERED",
        },
        variant: {
          productId: data.productId,
        },
      },
    });

    const review = await prisma.productReview.create({
      data: {
        productId: data.productId,
        userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        isVerified: !!hasPurchased,
        isApproved: true, // Auto-approve for now
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Update product average rating and review count
    await reviewService.updateProductRating(data.productId);

    return review;
  },

  getAll: async (filters: {
    productId?: string;
    userId?: string;
    isApproved?: boolean;
    page?: number;
    limit?: number;
  } = {}) => {
    const { productId, userId, isApproved, page = 1, limit = 20 } = filters;

    const where: Record<string, unknown> = {};

    if (productId) where.productId = productId;
    if (userId) where.userId = userId;
    if (isApproved !== undefined) where.isApproved = isApproved;

    const [rawReviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { select: { url: true }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productReview.count({ where }),
    ]);

    const reviews = rawReviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product?.name || "Product",
      productImage: r.product?.images?.[0]?.url || "/image/earphone.webp",
      userId: r.userId,
      userName: r.user?.name || "Customer",
      userEmail: r.user?.email || "",
      rating: r.rating,
      title: r.title || undefined,
      comment: r.comment || undefined,
      isVerified: r.isVerified,
      isApproved: r.isApproved,
      status: r.isApproved ? "approved" : "pending",
      createdAt: r.createdAt.toISOString(),
    }));

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getById: async (id: string) => {
    const review = await prisma.productReview.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return review;
  },

  update: async (id: string, userId: string, data: UpdateProductReviewData, isAdmin = false) => {
    const existingReview = await prisma.productReview.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new Error("REVIEW_NOT_FOUND");
    }

    // Only allow owner or admin to update
    if (!isAdmin && existingReview.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    // Non-admin users can only update rating, title, comment
    const updateData = isAdmin
      ? data
      : {
          rating: data.rating,
          title: data.title,
          comment: data.comment,
        };

    const review = await prisma.productReview.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Update product average rating if rating changed
    if (data.rating !== undefined) {
      await reviewService.updateProductRating(existingReview.productId);
    }

    return review;
  },

  delete: async (id: string, userId: string, isAdmin = false) => {
    const existingReview = await prisma.productReview.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new Error("REVIEW_NOT_FOUND");
    }

    // Only allow owner or admin to delete
    if (!isAdmin && existingReview.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    const productId = existingReview.productId;

    await prisma.productReview.delete({
      where: { id },
    });

    // Update product average rating
    await reviewService.updateProductRating(productId);

    return { success: true };
  },

  updateProductRating: async (productId: string) => {
    const reviews = await prisma.productReview.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { averageRating: 0, reviewCount: 0 },
      });
      return;
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Math.round(averageRating * 100) / 100,
        reviewCount: reviews.length,
      },
    });
  },
};