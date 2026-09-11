import { CreateBrandData, UpdateBrandData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { uploadImage } from "../utils/upload-image";

export const brandService = {
  create: async (data: CreateBrandData) => {
    const slug = generateSlug(data.name);

    const existingBrand = await prisma.brand.findFirst({
      where: {
        OR: [{ name: data.name }, { slug }],
      },
    });

    if (existingBrand) {
      throw new Error("BRAND_ALREADY_EXISTS");
    }

    let logoUrl: string | undefined;

    if (data.logo) {
      logoUrl = await uploadImage(data.logo, {
        folder: "brands",
      });
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        logoUrl,
      },
    });

    return brand;
  },

  getAll: async () => {
    const brands = await prisma.brand.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return brands;
  },

  getBySlug: async (slug: string) => {
    const brand = await prisma.brand.findUnique({
      where: {
        slug,
      },
    });

    return brand;
  },

  update: async (id: string, data: UpdateBrandData) => {
    const existingBrand = await prisma.brand.findUnique({
      where: {
        id,
      },
    });

    if (!existingBrand) {
      throw new Error("BRAND_NOT_FOUND");
    }

    let slug: string | undefined;
    let logoUrl: string | undefined;

    if (data.name) {
      slug = generateSlug(data.name);

      const duplicateBrand = await prisma.brand.findFirst({
        where: {
          id: {
            not: id,
          },
          OR: [{ name: data.name }, { slug }],
        },
      });

      if (duplicateBrand) {
        throw new Error("BRAND_ALREADY_EXISTS");
      }
    }

    if (data.logo) {
      logoUrl = await uploadImage(data.logo, {
        folder: "brands",
      });
    }

    const brand = await prisma.brand.update({
      where: {
        id,
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name,
          slug,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(logoUrl !== undefined && {
          logoUrl,
        }),
      },
    });

    return brand;
  },

  delete: async (id: string) => {
    const existingBrand = await prisma.brand.findUnique({
      where: {
        id,
      },
    });

    if (!existingBrand) {
      throw new Error("BRAND_NOT_FOUND");
    }

    const brand = await prisma.brand.delete({
      where: {
        id,
      },
    });

    return brand;
  },
};
