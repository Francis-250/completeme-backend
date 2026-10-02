import { CreateCategoryData, UpdateCategoryData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { uploadImage } from "../utils/upload-image";
import { getCache, setCache, delCache, delCachePattern } from "../lib/redis";

async function invalidateCategoryCaches(id?: string, slug?: string) {
  const tasks = [
    delCachePattern("categories:*"),
    delCachePattern("category:*"),
    delCachePattern("products:list:*"),
  ];
  if (id) {
    tasks.push(delCache(`category:id:${id}`));
  }
  if (slug) {
    tasks.push(delCache(`category:slug:${slug}`));
  }
  await Promise.allSettled(tasks);
}

export const categoryService = {
  create: async (data: CreateCategoryData) => {
    const slug = generateSlug(data.name);

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug }],
      },
    });

    if (existingCategory) {
      throw new Error("CATEGORY_ALREADY_EXISTS");
    }

    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentCategory) {
        throw new Error("PARENT_CATEGORY_NOT_FOUND");
      }
    }

    let imageUrl = data.imageUrl;

    if (data.image) {
      try {
        imageUrl = await uploadImage(data.image, {
          folder: "categories",
        });
      } catch (uploadErr) {
        console.warn("Category image upload error, using buffer fallback:", uploadErr);
        imageUrl = `data:${data.image.mimetype || "image/jpeg"};base64,${data.image.buffer.toString("base64")}`;
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
        imageUrl,
      },
    });

    await invalidateCategoryCaches(category.id, slug);

    return category;
  },

  getAll: async (includeChildren = false) => {
    const cacheKey = `categories:all:${includeChildren}`;
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const categories = await prisma.category.findMany({
      where: includeChildren ? {} : { parentId: null },
      include: includeChildren ? { children: true } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    await setCache(cacheKey, categories, 1800); // 30 mins cache

    return categories;
  },

  getBySlug: async (slug: string) => {
    const cacheKey = `category:slug:${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: { children: true, products: true },
    });

    if (category) {
      await setCache(cacheKey, category, 1800);
      if (category.id) {
        await setCache(`category:id:${category.id}`, category, 1800);
      }
    }

    return category;
  },

  getById: async (id: string) => {
    const cacheKey = `category:id:${id}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: { children: true, products: true },
    });

    if (category) {
      await setCache(cacheKey, category, 1800);
      if (category.slug) {
        await setCache(`category:slug:${category.slug}`, category, 1800);
      }
    }

    return category;
  },

  update: async (id: string, data: UpdateCategoryData) => {
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existingCategory) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    let slug: string | undefined;
    let imageUrl: string | undefined = data.imageUrl;

    if (data.name) {
      slug = generateSlug(data.name);

      const duplicateCategory = await prisma.category.findFirst({
        where: {
          id: { not: existingCategory.id },
          OR: [{ name: data.name }, { slug }],
        },
      });

      if (duplicateCategory) {
        throw new Error("CATEGORY_ALREADY_EXISTS");
      }
    }

    if (data.parentId) {
      if (data.parentId === existingCategory.id) {
        throw new Error("CANNOT_BE_OWN_PARENT");
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentCategory) {
        throw new Error("PARENT_CATEGORY_NOT_FOUND");
      }
    }

    if (data.image) {
      try {
        imageUrl = await uploadImage(data.image, {
          folder: "categories",
        });
      } catch (uploadErr) {
        console.warn("Category image upload error, using buffer fallback:", uploadErr);
        imageUrl = `data:${data.image.mimetype || "image/jpeg"};base64,${data.image.buffer.toString("base64")}`;
      }
    }

    const category = await prisma.category.update({
      where: { id: existingCategory.id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.parentId !== undefined && { parentId: data.parentId || null }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    await invalidateCategoryCaches(existingCategory.id, existingCategory.slug);
    if (slug && slug !== existingCategory.slug) {
      await delCache(`category:slug:${slug}`);
    }

    return category;
  },

  delete: async (id: string) => {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: { children: true, products: true },
    });

    if (!existingCategory) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    if (existingCategory.children.length > 0) {
      throw new Error("CATEGORY_HAS_CHILDREN");
    }

    if (existingCategory.products.length > 0) {
      throw new Error("CATEGORY_HAS_PRODUCTS");
    }

    const category = await prisma.category.delete({
      where: { id },
    });

    await invalidateCategoryCaches(id, existingCategory.slug);
    await Promise.allSettled([
      delCachePattern("category:*"),
      delCachePattern("categories:*"),
      delCachePattern("products:list:*"),
    ]);

    return category;
  },
};