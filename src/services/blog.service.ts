import { prisma } from "../lib/prisma";

export const blogService = {
  getAll: async (
    options: {
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const { category, search, page = 1, limit = 20 } = options;
    const where: any = { isPublished: true };

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  getBySlug: async (slug: string) => {
    return prisma.blogPost.findUnique({
      where: { slug },
    });
  },

  getById: async (id: string) => {
    return prisma.blogPost.findUnique({
      where: { id },
    });
  },

  create: async (data: {
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    category: string;
    image?: string;
    author?: string;
    authorRole?: string;
    authorAvatar?: string;
    readTime?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
  }) => {
    return prisma.blogPost.create({
      data,
    });
  },

  update: async (id: string, data: any) => {
    return prisma.blogPost.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.blogPost.delete({
      where: { id },
    });
  },
};
