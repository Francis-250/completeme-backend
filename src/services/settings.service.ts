import { prisma } from "../lib/prisma";

export const DEFAULT_SETTINGS = {
  storeName: "Shop Pulse",
  storeEmail: "hello@shoppulse.com",
  storePhone: "+1 (234) 567-890",
  storeAddress: "123 Market St, San Francisco, CA 94103",
  logoUrl: "",

  currency: "USD",
  currencySymbol: "$",
  timezone: "America/Los_Angeles",

  freeShippingThreshold: "50",
  flatShippingRate: "5.99",
  enableFreeShipping: true,
  enableLocalPickup: false,

  taxRate: "8",
  taxIncludedInPrice: false,

  orderPrefix: "SP-",
  lowStockThreshold: "10",
  allowGuestCheckout: true,
  enableReviews: true,
  enableWishlist: true,

  metaTitle: "Shop Pulse — Everyday essentials",
  metaDescription: "Curated audio, watches, and accessories made to last.",

  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
};

export const settingsService = {
  getSettings: async () => {
    try {
      const record = await prisma.storeSetting.findUnique({
        where: { id: "default" },
      });

      if (!record || !record.values) {
        // Initialize default
        const created = await prisma.storeSetting.upsert({
          where: { id: "default" },
          update: {},
          create: {
            id: "default",
            values: DEFAULT_SETTINGS,
          },
        });
        return (created.values as any) || DEFAULT_SETTINGS;
      }

      return {
        ...DEFAULT_SETTINGS,
        ...(typeof record.values === "object" ? record.values : {}),
      };
    } catch (err) {
      console.error("Failed to read settings from DB:", err);
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings: async (newValues: Record<string, any>) => {
    try {
      const current = await settingsService.getSettings();
      const merged = { ...current, ...newValues };

      const updated = await prisma.storeSetting.upsert({
        where: { id: "default" },
        update: {
          values: merged,
        },
        create: {
          id: "default",
          values: merged,
        },
      });

      return (updated.values as any) || merged;
    } catch (err) {
      console.error("Failed to update settings in DB:", err);
      return { ...DEFAULT_SETTINGS, ...newValues };
    }
  },
};
