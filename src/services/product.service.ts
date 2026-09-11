import { CreateProductData, UpdateProductData, CreateProductVariantData, UpdateProductVariantData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { uploadImage } from "../utils/upload-image";

export const productService = {
  create: async (data: CreateProductData, vendorId?: string) => {
    const slug = generateSlug(data.name);

    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ name: data.name }, { slug }],
      },
    });

    if (existingProduct) {
      throw new Error("PRODUCT_ALREADY_EXISTS");
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
      }
    }

    if (data.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: data.brandId },
      });

      if (!brand) {
        throw new Error("BRAND_NOT_FOUND");
      }
    }

    const effectiveVendorId = vendorId || data.vendorId;
    if (effectiveVendorId) {
      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: effectiveVendorId },
      });

      if (!vendor) {
        throw new Error("VENDOR_NOT_FOUND");
      }
    }

    const images: { url: string; altText?: string; sortOrder: number; isPrimary: boolean }[] = [];

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const imageUrl = await uploadImage(data.images[i], {
          folder: "products",
        });

        images.push({
          url: imageUrl,
          sortOrder: i,
          isPrimary: i === 0,
        });
      }
    } else if (data.imageUrls && data.imageUrls.length > 0) {
      for (let i = 0; i < data.imageUrls.length; i++) {
        const item = data.imageUrls[i];
        images.push({
          url: typeof item === "string" ? item : item.url,
          altText: typeof item === "object" ? item.altText : undefined,
          sortOrder: typeof item === "object" && item.sortOrder !== undefined ? item.sortOrder : i,
          isPrimary: typeof item === "object" && item.isPrimary !== undefined ? item.isPrimary : i === 0,
        });
      }
    }

    const variants = data.variants.map((variant, index) => ({
      ...variant,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      attributes: variant.attributes as Record<string, unknown>,
    }));

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        categoryId: data.categoryId,
        brandId: data.brandId,
        vendorId: effectiveVendorId,
        isActive: data.isActive ?? true,
        images: {
          create: images,
        },
        variants: {
          create: variants.map((variant) => ({
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            stockQuantity: variant.stockQuantity,
            weight: variant.weight,
            attributes: (variant.attributes ?? {}) as any,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
        vendor: true,
      },
    });

    // Upload variant images
    if (data.variants.some((v) => v.images && v.images.length > 0)) {
      for (const variant of data.variants) {
        if (variant.images && variant.images.length > 0) {
          for (let j = 0; j < variant.images.length; j++) {
            const imageUrl = await uploadImage(variant.images[j], {
              folder: "products/variants",
            });

            await prisma.productImage.create({
              data: {
                productId: product.id,
                url: imageUrl,
                sortOrder: images.length + j,
                isPrimary: false,
              },
            });
          }
        }
      }
    }

    // Re-fetch with updated images
    const finalProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
        vendor: true,
      },
    });

    return finalProduct;
  },

  getAll: async (filters: {
    categoryId?: string;
    brandId?: string;
    vendorId?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const {
      categoryId,
      brandId,
      vendorId,
      isActive,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: Record<string, unknown> = {};

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (vendorId) where.vendorId = vendorId;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: true,
          variants: true,
          category: true,
          brand: true,
          vendor: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getBySlug: async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
        vendor: true,
        tags: { include: { tag: true } },
        collections: { include: { collection: true } },
        reviews: {
          where: { isApproved: true },
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return product;
  },

  getById: async (id: string) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
        vendor: true,
        tags: { include: { tag: true } },
        collections: { include: { collection: true } },
        reviews: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return product;
  },

  update: async (id: string, data: UpdateProductData, vendorId?: string) => {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });

    if (!existingProduct) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Check vendor ownership if vendorId provided
    if (vendorId && existingProduct.vendorId !== vendorId) {
      throw new Error("FORBIDDEN");
    }

    let slug: string | undefined;

    if (data.name) {
      slug = generateSlug(data.name);

      const duplicateProduct = await prisma.product.findFirst({
        where: {
          id: { not: id },
          OR: [{ name: data.name }, { slug }],
        },
      });

      if (duplicateProduct) {
        throw new Error("PRODUCT_ALREADY_EXISTS");
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
      }
    }

    if (data.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: data.brandId },
      });

      if (!brand) {
        throw new Error("BRAND_NOT_FOUND");
      }
    }

    if (data.vendorId) {
      const vendor = await prisma.vendorProfile.findUnique({
        where: { id: data.vendorId },
      });

      if (!vendor) {
        throw new Error("VENDOR_NOT_FOUND");
      }
    }

    // Handle new images upload
    let newImages: { url: string; altText?: string; sortOrder: number; isPrimary: boolean }[] = [];

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const imageUrl = await uploadImage(data.images[i], {
          folder: "products",
        });

        newImages.push({
          url: imageUrl,
          sortOrder: existingProduct.images.length + i,
          isPrimary: existingProduct.images.length === 0 && i === 0,
        });
      }
    } else if (data.imageUrls && data.imageUrls.length > 0) {
      // Overwrite images if an explicit list was passed
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
      await prisma.productImage.createMany({
        data: data.imageUrls.map((img, idx) => ({
          productId: id,
          url: typeof img === "string" ? img : img.url,
          altText: typeof img === "object" ? img.altText : null,
          sortOrder: typeof img === "object" && img.sortOrder !== undefined ? img.sortOrder : idx,
          isPrimary: typeof img === "object" && img.isPrimary !== undefined ? img.isPrimary : idx === 0,
        })),
      });
    }

    // Handle variants update if provided
    if (data.variants && data.variants.length > 0) {
      for (const v of data.variants) {
        const existingVariant = existingProduct.variants.find(
          (ev) => ev.sku === v.sku || (v as any).id === ev.id,
        );
        if (existingVariant) {
          await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stockQuantity: v.stockQuantity,
              weight: v.weight,
              attributes: (v.attributes ?? {}) as any,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              stockQuantity: v.stockQuantity,
              weight: v.weight,
              attributes: (v.attributes ?? {}) as any,
            },
          });
        }
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
        ...(data.brandId !== undefined && { brandId: data.brandId || null }),
        ...(data.vendorId !== undefined && { vendorId: data.vendorId || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(newImages.length > 0 && {
          images: { create: newImages },
        }),
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
        vendor: true,
      },
    });

    return product;
  },

  delete: async (id: string, vendorId?: string) => {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });

    if (!existingProduct) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Check vendor ownership if vendorId provided
    if (vendorId && existingProduct.vendorId !== vendorId) {
      throw new Error("FORBIDDEN");
    }

    await prisma.product.delete({
      where: { id },
    });

    return { success: true };
  },

  // Variant methods
  createVariant: async (productId: string, data: CreateProductVariantData, vendorId?: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (vendorId && product.vendorId !== vendorId) {
      throw new Error("FORBIDDEN");
    }

    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });

    if (existingVariant) {
      throw new Error("VARIANT_SKU_EXISTS");
    }

    const images: { url: string; sortOrder: number; isPrimary: boolean }[] = [];

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const imageUrl = await uploadImage(data.images[i], {
          folder: "products/variants",
        });

        images.push({
          url: imageUrl,
          sortOrder: i,
          isPrimary: i === 0,
        });
      }
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: data.sku,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        stockQuantity: data.stockQuantity,
        weight: data.weight,
        attributes: (data.attributes ?? {}) as any,
      },
    });

    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img) => ({
          productId,
          ...img,
        })),
      });
    }

    return variant;
  },

  updateVariant: async (variantId: string, data: UpdateProductVariantData, vendorId?: string) => {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { images: true } } },
    });

    if (!existingVariant) {
      throw new Error("VARIANT_NOT_FOUND");
    }

    if (vendorId && existingVariant.product.vendorId !== vendorId) {
      throw new Error("FORBIDDEN");
    }

    if (data.sku) {
      const existingSku = await prisma.productVariant.findFirst({
        where: { sku: data.sku, id: { not: variantId } },
      });

      if (existingSku) {
        throw new Error("VARIANT_SKU_EXISTS");
      }
    }

    // Handle new images
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        const imageUrl = await uploadImage(data.images[i], {
          folder: "products/variants",
        });

        await prisma.productImage.create({
          data: {
            productId: existingVariant.productId,
            url: imageUrl,
            sortOrder: existingVariant.product.images.length + i,
            isPrimary: existingVariant.product.images.length === 0 && i === 0,
          },
        });
      }
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.attributes !== undefined && { attributes: data.attributes as any }),
      },
    });

    return variant;
  },

  deleteVariant: async (variantId: string, vendorId?: string) => {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!existingVariant) {
      throw new Error("VARIANT_NOT_FOUND");
    }

    if (vendorId && existingVariant.product.vendorId !== vendorId) {
      throw new Error("FORBIDDEN");
    }

    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return { success: true };
  },

  // Tag management
  addTag: async (productId: string, tagId: string, vendorId?: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (vendorId && product.vendorId !== vendorId) {
      throw new Error("FORBIDDEN");
    }

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new Error("TAG_NOT_FOUND");
    }

    const existing = await prisma.productTag.findUnique({
      where: { productId_tagId: { productId, tagId } },
    });

    if (existing) {
      throw new Error("TAG_ALREADY_ADDED");
    }

    await prisma.productTag.create({
      data: { productId, tagId },
    });

    return { success: true };
  },

  removeTag: async (productId: string, tagId: string, vendorId?: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (vendorId && product.vendorId !== vendorId) {
      throw new Error("FORBIDDEN");
    }

    const existing = await prisma.productTag.findUnique({
      where: { productId_tagId: { productId, tagId } },
    });

    if (!existing) {
      throw new Error("TAG_NOT_ON_PRODUCT");
    }

    await prisma.productTag.delete({
      where: { productId_tagId: { productId, tagId } },
    });

    return { success: true };
  },
};