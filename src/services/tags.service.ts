import { CreateTagData, UpdateTagData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { getCache, setCache, delCache, delCachePattern } from "../lib/redis";

async function invalidateTagCaches(id?: string, slug?: string) {
  const tasks = [
    delCachePattern("tags:*"),
    delCachePattern("products:list:*"),
  ];
  if (id) tasks.push(delCache(`tag:id:${id}`));
  if (slug) tasks.push(delCache(`tag:slug:${slug}`));
  await Promise.allSettled(tasks);
}

export const tagService = {
  create: async (data: CreateTagData) => {
    const slug = generateSlug(data.name);

    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [{ name: data.name }, { slug }],
      },
    });

    if (existingTag) {
      throw new Error("TAG_ALREADY_EXISTS");
    }

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        slug,
      },
    });

    await invalidateTagCaches(tag.id, slug);

    return tag;
  },

  getAll: async () => {
    const cacheKey = "tags:all";
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const tags = await prisma.tag.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    await setCache(cacheKey, tags, 1800);

    return tags;
  },

  getBySlug: async (slug: string) => {
    const cacheKey = `tag:slug:${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (tag) {
      await setCache(cacheKey, tag, 1800);
      if (tag.id) {
        await setCache(`tag:id:${tag.id}`, tag, 1800);
      }
    }

    return tag;
  },

  getById: async (id: string) => {
    const cacheKey = `tag:id:${id}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (tag) {
      await setCache(cacheKey, tag, 1800);
      if (tag.slug) {
        await setCache(`tag:slug:${tag.slug}`, tag, 1800);
      }
    }

    return tag;
  },

  update: async (id: string, data: UpdateTagData) => {
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new Error("TAG_NOT_FOUND");
    }

    let slug: string | undefined;

    if (data.name) {
      slug = generateSlug(data.name);

      const duplicateTag = await prisma.tag.findFirst({
        where: {
          id: { not: id },
          OR: [{ name: data.name }, { slug }],
        },
      });

      if (duplicateTag) {
        throw new Error("TAG_ALREADY_EXISTS");
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug }),
      },
    });

    await invalidateTagCaches(tag.id, tag.slug);
    if (existingTag.slug && existingTag.slug !== tag.slug) {
      await invalidateTagCaches(tag.id, existingTag.slug);
    }

    return tag;
  },

  delete: async (id: string) => {
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!existingTag) {
      throw new Error("TAG_NOT_FOUND");
    }

    if (existingTag.products.length > 0) {
      throw new Error("TAG_HAS_PRODUCTS");
    }

    const tag = await prisma.tag.delete({
      where: { id },
    });

    await invalidateTagCaches(existingTag.id, existingTag.slug);

    return tag;
  },
};