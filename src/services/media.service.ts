import cloudinary from "../lib/cloudinary";
import { prisma } from "../lib/prisma";
import { uploadImage } from "../utils/upload-image";

export interface MediaResource {
  asset_id: string;
  public_id: string;
  format: string;
  version?: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  folder: string;
  url: string;
  secure_url: string;
}

export interface MediaResponse {
  resources: MediaResource[];
  next_cursor?: string | null;
  total_count?: number;
  folders: string[];
}

const APP_FOLDERS = ["products", "categories", "brands", "collections", "vendors", "banners", "uploads"];

export const mediaService = {
  getFolders: async (): Promise<string[]> => {
    try {
      const res = await cloudinary.api.root_folders();
      const folderNames = res.folders?.map((f: any) => f.name) || [];
      return Array.from(new Set([...APP_FOLDERS, ...folderNames]));
    } catch (error) {
      return APP_FOLDERS;
    }
  },

  getMedia: async (params: {
    folder?: string;
    next_cursor?: string;
    limit?: number;
    search?: string;
  }): Promise<MediaResponse> => {
    const limit = Math.min(Math.max(params.limit || 50, 1), 100);
    const folder = params.folder && params.folder !== "all" ? params.folder : undefined;

    try {
      const options: Record<string, any> = {
        type: "upload",
        resource_type: "image",
        max_results: limit,
      };

      if (folder) {
        options.prefix = `${folder}/`;
      }

      if (params.next_cursor) {
        options.next_cursor = params.next_cursor;
      }

      const result = await cloudinary.api.resources(options);

      const resources: MediaResource[] = (result.resources || []).map((item: any) => {
        const itemFolder =
          item.folder ||
          (item.public_id.includes("/") ? item.public_id.split("/")[0] : "uploads");
        return {
          asset_id: item.asset_id || item.public_id,
          public_id: item.public_id,
          format: item.format || "jpg",
          version: item.version,
          resource_type: item.resource_type || "image",
          type: item.type || "upload",
          created_at: item.created_at,
          bytes: item.bytes || 0,
          width: item.width,
          height: item.height,
          folder: itemFolder,
          url: item.url,
          secure_url: item.secure_url || item.url,
        };
      });

      let filtered = resources;
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.public_id.toLowerCase().includes(q) ||
            r.format.toLowerCase().includes(q) ||
            r.folder.toLowerCase().includes(q),
        );
      }

      const folders = await mediaService.getFolders();

      return {
        resources: filtered,
        next_cursor: result.next_cursor || null,
        total_count: result.total_count ?? filtered.length,
        folders,
      };
    } catch (cloudinaryError: any) {
      console.warn(
        "Cloudinary api.resources failed (falling back to database assets):",
        cloudinaryError?.message || cloudinaryError,
      );

      // Fallback: Aggregate image assets from database catalog
      return await mediaService.getDatabaseFallbackMedia(params);
    }
  },

  getDatabaseFallbackMedia: async (params: {
    folder?: string;
    limit?: number;
    search?: string;
  }): Promise<MediaResponse> => {
    const resources: MediaResource[] = [];

    // 1. Product images
    const productImages = await prisma.productImage.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    for (const img of productImages) {
      if (img.url) {
        resources.push({
          asset_id: img.id,
          public_id: `products/${img.id}`,
          format: img.url.split(".").pop()?.split("?")[0] || "jpg",
          resource_type: "image",
          type: "upload",
          created_at: img.createdAt.toISOString(),
          bytes: 125000,
          width: 800,
          height: 800,
          folder: "products",
          url: img.url,
          secure_url: img.url,
        });
      }
    }

    // 2. Categories
    const categories = await prisma.category.findMany({
      where: { imageUrl: { not: null } },
      take: 50,
    });
    for (const cat of categories) {
      if (cat.imageUrl) {
        resources.push({
          asset_id: cat.id,
          public_id: `categories/${cat.slug}`,
          format: cat.imageUrl.split(".").pop()?.split("?")[0] || "jpg",
          resource_type: "image",
          type: "upload",
          created_at: cat.createdAt.toISOString(),
          bytes: 95000,
          width: 600,
          height: 600,
          folder: "categories",
          url: cat.imageUrl,
          secure_url: cat.imageUrl,
        });
      }
    }

    // 3. Brands
    const brands = await prisma.brand.findMany({
      where: { logoUrl: { not: null } },
      take: 50,
    });
    for (const b of brands) {
      if (b.logoUrl) {
        resources.push({
          asset_id: b.id,
          public_id: `brands/${b.slug}`,
          format: b.logoUrl.split(".").pop()?.split("?")[0] || "jpg",
          resource_type: "image",
          type: "upload",
          created_at: b.createdAt.toISOString(),
          bytes: 80000,
          width: 400,
          height: 400,
          folder: "brands",
          url: b.logoUrl,
          secure_url: b.logoUrl,
        });
      }
    }

    // 4. Collections
    const collections = await prisma.collection.findMany({
      where: { imageUrl: { not: null } },
      take: 50,
    });
    for (const col of collections) {
      if (col.imageUrl) {
        resources.push({
          asset_id: col.id,
          public_id: `collections/${col.slug}`,
          format: col.imageUrl.split(".").pop()?.split("?")[0] || "jpg",
          resource_type: "image",
          type: "upload",
          created_at: col.createdAt.toISOString(),
          bytes: 140000,
          width: 1200,
          height: 600,
          folder: "collections",
          url: col.imageUrl,
          secure_url: col.imageUrl,
        });
      }
    }

    // 5. Uploaded Media Assets (stored in database)
    try {
      const mediaAssets = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      for (const m of mediaAssets) {
        resources.push({
          asset_id: m.id,
          public_id: m.publicId,
          format: m.format,
          resource_type: m.resourceType,
          type: "upload",
          created_at: m.createdAt.toISOString(),
          bytes: m.bytes,
          width: m.width || 800,
          height: m.height || 800,
          folder: m.folder,
          url: m.url,
          secure_url: m.secureUrl,
        });
      }
    } catch (err) {
      console.warn("Failed to read MediaAsset records:", err);
    }

    let filtered = resources;
    if (params.folder && params.folder !== "all") {
      filtered = filtered.filter((r) => r.folder === params.folder);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.public_id.toLowerCase().includes(q) ||
          r.folder.toLowerCase().includes(q),
      );
    }

    return {
      resources: filtered.slice(0, params.limit || 50),
      next_cursor: null,
      total_count: filtered.length,
      folders: APP_FOLDERS,
    };
  },

  upload: async (file: Express.Multer.File, folder = "uploads"): Promise<MediaResource> => {
    let secureUrl: string;
    try {
      secureUrl = await uploadImage(file, { folder });
    } catch (err: any) {
      console.warn("Cloudinary upload failed (using buffer data URI fallback):", err?.message || err);
      secureUrl = `data:${file.mimetype || "image/jpeg"};base64,${file.buffer.toString("base64")}`;
    }

    const filename = file.originalname.replace(/\.[^/.]+$/, "");
    const publicId = `${folder}/${Date.now()}_${filename}`;
    const format = file.mimetype.split("/")[1] || "jpg";

    // Persist to MediaAsset in DB so uploaded images survive page refreshes
    try {
      await prisma.mediaAsset.create({
        data: {
          publicId,
          url: secureUrl,
          secureUrl,
          format,
          bytes: file.size,
          width: 800,
          height: 800,
          folder,
        },
      });
    } catch (dbErr) {
      console.warn("Failed to persist MediaAsset to database:", dbErr);
    }

    return {
      asset_id: `media_${Date.now()}`,
      public_id: publicId,
      format,
      resource_type: "image",
      type: "upload",
      created_at: new Date().toISOString(),
      bytes: file.size,
      width: 800,
      height: 800,
      folder,
      url: secureUrl,
      secure_url: secureUrl,
    };
  },

  delete: async (rawPublicId: string): Promise<boolean> => {
    const publicId = decodeURIComponent(rawPublicId);
    console.log(`[MediaService.delete] Deleting media: "${publicId}"`);

    // 1. Destroy on Cloudinary if it exists there
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn("Cloudinary destroy failed/skipped:", err);
    }

    // 2. Delete from MediaAsset table
    try {
      await prisma.mediaAsset.deleteMany({
        where: {
          OR: [
            { publicId: publicId },
            { publicId: rawPublicId },
            { url: { contains: publicId } },
          ],
        },
      });
    } catch (err) {
      console.error("Failed to delete from MediaAsset table:", err);
    }

    // 3. If it's a product image (e.g. "products/img-id" or "products/uuid")
    if (publicId.startsWith("products/")) {
      const imgId = publicId.replace(/^products\//, "");
      try {
        await prisma.productImage.deleteMany({
          where: {
            OR: [
              { id: imgId },
              { url: { contains: imgId } },
            ],
          },
        });
      } catch (err) {
        console.error("Failed to delete ProductImage:", err);
      }
    }

    // 4. If it's a category image (e.g. "categories/slug" or "categories/uuid")
    if (publicId.startsWith("categories/")) {
      const catIdentifier = publicId.replace(/^categories\//, "");
      try {
        await prisma.category.updateMany({
          where: {
            OR: [
              { slug: catIdentifier },
              { id: catIdentifier },
              { imageUrl: { contains: catIdentifier } },
            ],
          },
          data: { imageUrl: null },
        });
      } catch (err) {
        console.error("Failed to clear Category image:", err);
      }
    }

    // 5. If it's a brand logo (e.g. "brands/slug" or "brands/uuid")
    if (publicId.startsWith("brands/")) {
      const brandIdentifier = publicId.replace(/^brands\//, "");
      try {
        await prisma.brand.updateMany({
          where: {
            OR: [
              { slug: brandIdentifier },
              { id: brandIdentifier },
              { logoUrl: { contains: brandIdentifier } },
            ],
          },
          data: { logoUrl: null },
        });
      } catch (err) {
        console.error("Failed to clear Brand logo:", err);
      }
    }

    // 6. If it's a collection image (e.g. "collections/slug" or "collections/uuid")
    if (publicId.startsWith("collections/")) {
      const colIdentifier = publicId.replace(/^collections\//, "");
      try {
        await prisma.collection.updateMany({
          where: {
            OR: [
              { slug: colIdentifier },
              { id: colIdentifier },
              { imageUrl: { contains: colIdentifier } },
            ],
          },
          data: { imageUrl: null },
        });
      } catch (err) {
        console.error("Failed to clear Collection image:", err);
      }
    }

    // 7. General fallback: if publicId matches any productImage id directly
    try {
      await prisma.productImage.deleteMany({
        where: {
          OR: [
            { id: publicId },
            { url: { contains: publicId } },
          ],
        },
      });
    } catch {}

    return true;
  },
};
