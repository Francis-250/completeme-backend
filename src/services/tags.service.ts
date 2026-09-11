import { CreateTagData, UpdateTagData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";

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

    return tag;
  },

  getAll: async () => {
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

    return tags;
  },

  getBySlug: async (slug: string) => {
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

    return tag;
  },

  getById: async (id: string) => {
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

    return tag;
  },
};