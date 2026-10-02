import { CreateCollectionData, UpdateCollectionData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { uploadImage } from "../utils/upload-image";
import { getCache, setCache, delCache, delCachePattern } from "../lib/redis";

async function invalidateCollectionCaches(id?: string, slug?: string) {
  const tasks = [
    delCachePattern("collections:*"),
    delCachePattern("collection:*"),
  ];
  if (id) tasks.push(delCache(`collection:id:${id}`));
  if (slug) tasks.push(delCache(`collection:slug:${slug}`));
  await Promise.allSettled(tasks);
}

export const collectionService = {
  create: async (data: CreateCollectionData) => {
    const slug = generateSlug(data.name);

    const existingCollection = await prisma.collection.findFirst({
      where: {
        OR: [{ name: data.name }, { slug }],
      },
    });

    if (existingCollection) {
      throw new Error("COLLECTION_ALREADY_EXISTS");
    }

    let imageUrl: string | undefined;

    if (data.image) {
      imageUrl = await uploadImage(data.image, {
        folder: "collections",
      });
    }

    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl,
        isActive: data.isActive ?? true,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    await invalidateCollectionCaches(collection.id, slug);

    return collection;
  },

  getAll: async (includeInactive = false) => {
    const cacheKey = `collections:all:${includeInactive}`;
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const where = includeInactive ? {} : { isActive: true };

    const collections = await prisma.collection.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    await setCache(cacheKey, collections, 1800);

    return collections;
  },

  getBySlug: async (slug: string) => {
    const cacheKey = `collection:slug:${slug}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (collection) {
      await setCache(cacheKey, collection, 1800);
      if (collection.id) {
        await setCache(`collection:id:${collection.id}`, collection, 1800);
      }
    }

    return collection;
  },

  getById: async (id: string) => {
    const cacheKey = `collection:id:${id}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    if (collection) {
      await setCache(cacheKey, collection, 1800);
      if (collection.slug) {
        await setCache(`collection:slug:${collection.slug}`, collection, 1800);
      }
    }

    return collection;
  },

  update: async (id: string, data: UpdateCollectionData) => {
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      throw new Error("COLLECTION_NOT_FOUND");
    }

    let slug: string | undefined;
    let imageUrl: string | undefined;

    if (data.name) {
      slug = generateSlug(data.name);

      const duplicateCollection = await prisma.collection.findFirst({
        where: {
          id: { not: id },
          OR: [{ name: data.name }, { slug }],
        },
      });

      if (duplicateCollection) {
        throw new Error("COLLECTION_ALREADY_EXISTS");
      }
    }

    if (data.image) {
      imageUrl = await uploadImage(data.image, {
        folder: "collections",
      });
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    await invalidateCollectionCaches(collection.id, collection.slug);
    if (existingCollection.slug && existingCollection.slug !== collection.slug) {
      await invalidateCollectionCaches(collection.id, existingCollection.slug);
    }

    return collection;
  },

  delete: async (id: string) => {
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!existingCollection) {
      throw new Error("COLLECTION_NOT_FOUND");
    }

    const collection = await prisma.collection.delete({
      where: { id },
    });

    await invalidateCollectionCaches(existingCollection.id, existingCollection.slug);

    return collection;
  },

  addProduct: async (collectionId: string, productId: string, sortOrder = 0) => {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error("COLLECTION_NOT_FOUND");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const existing = await prisma.collectionProduct.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    if (existing) {
      throw new Error("PRODUCT_ALREADY_IN_COLLECTION");
    }

    const collectionProduct = await prisma.collectionProduct.create({
      data: {
        collectionId,
        productId,
        sortOrder,
      },
    });

    await invalidateCollectionCaches(collectionId, collection.slug);

    return collectionProduct;
  },

  removeProduct: async (collectionId: string, productId: string) => {
    const existing = await prisma.collectionProduct.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new Error("PRODUCT_NOT_IN_COLLECTION");
    }

    await prisma.collectionProduct.delete({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    await invalidateCollectionCaches(collectionId);

    return { success: true };
  },

  updateProductSortOrder: async (collectionId: string, productId: string, sortOrder: number) => {
    const existing = await prisma.collectionProduct.findUnique({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new Error("PRODUCT_NOT_IN_COLLECTION");
    }

    const collectionProduct = await prisma.collectionProduct.update({
      where: {
        collectionId_productId: {
          collectionId,
          productId,
        },
      },
      data: { sortOrder },
    });

    await invalidateCollectionCaches(collectionId);

    return collectionProduct;
  },
};