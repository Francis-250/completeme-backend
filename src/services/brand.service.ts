import { CreateBrandData, UpdateBrandData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { uploadImage } from "../utils/upload-image";
import { getCache, setCache, delCache, delCachePattern } from "../lib/redis";

async function invalidateBrandCaches(id?: string, slug?: string) {
  const tasks = [
    delCachePattern("brands:*"),
    delCachePattern("brand:*"),
    delCachePattern("products:list:*"),
  ];
  if (id) tasks.push(delCache(`brand:id:${id}`));
  if (slug) tasks.push(delCache(`brand:slug:${slug}`));
  await Promise.allSettled(tasks);
}

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

    await invalidateBrandCaches(brand.id, slug);

    return brand;
  },

  getAll: async () => {
    const cacheKey = "brands:all";
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const brands = await prisma.brand.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    await setCache(cacheKey, brands, 1800);

    return brands;
  },

  getBySlug: async (slug: string) => {
    const cacheKey = `brand:slug:${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const brand = await prisma.brand.findUnique({
      where: {
        slug,
      },
    });

    if (brand) {
      await setCache(cacheKey, brand, 1800);
      if (brand.id) {
        await setCache(`brand:id:${brand.id}`, brand, 1800);
      }
    }

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

    await invalidateBrandCaches(existingBrand.id, existingBrand.slug);
    if (slug && slug !== existingBrand.slug) {
      await delCache(`brand:slug:${slug}`);
    }

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

    await invalidateBrandCaches(id, existingBrand.slug);
    await Promise.allSettled([
      delCachePattern("brand:*"),
      delCachePattern("brands:*"),
      delCachePattern("products:list:*"),
    ]);

    return brand;
  },
};
