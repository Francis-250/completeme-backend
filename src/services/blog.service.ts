import { prisma } from "../lib/prisma";
import { getCache, setCache, delCache, delCachePattern } from "../lib/redis";

async function invalidateBlogCaches(id?: string, slug?: string) {
  const tasks = [
    delCachePattern("blog:*"),
  ];
  if (id) tasks.push(delCache(`blog:id:${id}`));
  if (slug) tasks.push(delCache(`blog:slug:${slug}`));
  await Promise.allSettled(tasks);
}

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
    const cacheKey = `blog:list:${JSON.stringify({
      category: category || "",
      search: search?.toLowerCase().trim() || "",
      page,
      limit,
    })}`;

    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

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

    const result = {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };

    await setCache(cacheKey, result, 1800); // 30 mins

    return result;
  },

  getBySlug: async (slug: string) => {
    const cacheKey = `blog:slug:${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    let post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post) {
      post = await prisma.blogPost.findUnique({
        where: { id: slug },
      });
    }

    if (post) {
      await setCache(cacheKey, post, 1800);
      if (post.id) {
        await setCache(`blog:id:${post.id}`, post, 1800);
      }
    }

    return post;
  },

  getById: async (id: string) => {
    const cacheKey = `blog:id:${id}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (post) {
      await setCache(cacheKey, post, 1800);
      if (post.slug) {
        await setCache(`blog:slug:${post.slug}`, post, 1800);
      }
    }

    return post;
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
    const post = await prisma.blogPost.create({
      data,
    });
    await invalidateBlogCaches(post.id, post.slug);
    return post;
  },

  update: async (id: string, data: any) => {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    const post = await prisma.blogPost.update({
      where: { id },
      data,
    });
    await invalidateBlogCaches(id, post.slug);
    if (existing?.slug && existing.slug !== post.slug) {
      await invalidateBlogCaches(id, existing.slug);
    }
    return post;
  },

  delete: async (id: string) => {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    const post = await prisma.blogPost.delete({
      where: { id },
    });
    if (existing) {
      await invalidateBlogCaches(id, existing.slug);
    } else {
      await invalidateBlogCaches(id);
    }
    return post;
  },
};
