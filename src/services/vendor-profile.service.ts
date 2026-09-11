import { CreateVendorProfileData, UpdateVendorProfileData } from "../types/catalog.types";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/helpers";
import { uploadImage } from "../utils/upload-image";

export const vendorProfileService = {
  create: async (data: CreateVendorProfileData) => {
    const slug = generateSlug(data.companyName);

    // Check if user already has a vendor profile
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: data.userId },
    });

    if (existingProfile) {
      throw new Error("VENDOR_PROFILE_EXISTS");
    }

    // Check if company name or slug already exists
    const duplicate = await prisma.vendorProfile.findFirst({
      where: {
        OR: [{ companyName: data.companyName }, { slug }],
      },
    });

    if (duplicate) {
      throw new Error("VENDOR_ALREADY_EXISTS");
    }

    let logoUrl: string | undefined;

    if (data.logo) {
      logoUrl = await uploadImage(data.logo, {
        folder: "vendors",
      });
    }

    const vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: data.userId,
        companyName: data.companyName,
        slug,
        description: data.description,
        logoUrl,
        isActive: data.isActive ?? true,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        products: {
          include: { images: true, variants: { include: { images: true } } },
        },
      },
    });

    return vendorProfile;
  },

  getAll: async (includeInactive = false) => {
    const where = includeInactive ? {} : { isActive: true };

    const vendorProfiles = await prisma.vendorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        products: {
          include: { images: true, variants: { include: { images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return vendorProfiles;
  },

  getBySlug: async (slug: string) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        products: {
          where: { isActive: true },
          include: { images: true, variants: { include: { images: true } } },
        },
      },
    });

    return vendorProfile;
  },

  getById: async (id: string) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        products: {
          include: { images: true, variants: { include: { images: true } } },
        },
      },
    });

    return vendorProfile;
  },

  getByUserId: async (userId: string) => {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        products: {
          include: { images: true, variants: { include: { images: true } } },
        },
      },
    });

    return vendorProfile;
  },

  update: async (id: string, data: UpdateVendorProfileData, userId?: string, isAdmin = false) => {
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      throw new Error("VENDOR_PROFILE_NOT_FOUND");
    }

    // Check ownership
    if (!isAdmin && existingProfile.userId !== userId) {
      throw new Error("FORBIDDEN");
    }

    let slug: string | undefined;
    let logoUrl: string | undefined;

    if (data.companyName) {
      slug = generateSlug(data.companyName);

      const duplicate = await prisma.vendorProfile.findFirst({
        where: {
          id: { not: id },
          OR: [{ companyName: data.companyName }, { slug }],
        },
      });

      if (duplicate) {
        throw new Error("VENDOR_ALREADY_EXISTS");
      }
    }

    if (data.logo) {
      logoUrl = await uploadImage(data.logo, {
        folder: "vendors",
      });
    }

    const vendorProfile = await prisma.vendorProfile.update({
      where: { id },
      data: {
        ...(data.companyName !== undefined && { companyName: data.companyName, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        products: {
          include: { images: true, variants: { include: { images: true } } },
        },
      },
    });

    return vendorProfile;
  },

  delete: async (id: string, isAdmin = false) => {
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!existingProfile) {
      throw new Error("VENDOR_PROFILE_NOT_FOUND");
    }

    // Only admin can delete
    if (!isAdmin) {
      throw new Error("FORBIDDEN");
    }

    if (existingProfile.products.length > 0) {
      throw new Error("VENDOR_HAS_PRODUCTS");
    }

    await prisma.vendorProfile.delete({
      where: { id },
    });

    return { success: true };
  },
};