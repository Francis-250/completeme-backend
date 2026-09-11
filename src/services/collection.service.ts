import { CreateCollectionData, UpdateCollectionData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { uploadImage } from "../utils/upload-image";

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

    return collection;
  },

  getAll: async (includeInactive = false) => {
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

    return collections;
  },

  getBySlug: async (slug: string) => {
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

    return collection;
  },

  getById: async (id: string) => {
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

    return collectionProduct;
  },
};