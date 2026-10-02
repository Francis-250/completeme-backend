import { prisma } from "../lib/prisma";
import { getCache, setCache, delCache } from "../lib/redis";

const SETTINGS_CACHE_KEY = "settings:store";

export const settingsService = {
  getSettings: async (): Promise<Record<string, any>> => {
    try {
      const cached = await getCache<Record<string, any>>(SETTINGS_CACHE_KEY);
      if (cached && typeof cached === "object") {
        return cached;
      }

      const record = await prisma.storeSetting.findUnique({
        where: { id: "default" },
      });

      if (!record || !record.values || typeof record.values !== "object") {
        return {};
      }

      const settings = record.values as Record<string, any>;
      await setCache(SETTINGS_CACHE_KEY, settings, 3600); // 1 hour TTL

      return settings;
    } catch (err) {
      console.error("Failed to read settings from database:", err);
      return {};
    }
  },

  updateSettings: async (newValues: Record<string, any>): Promise<Record<string, any>> => {
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

      const finalValues = (updated.values as Record<string, any>) || merged;

      // Invalidate and update Redis cache immediately
      await delCache(SETTINGS_CACHE_KEY);
      await setCache(SETTINGS_CACHE_KEY, finalValues, 3600);

      return finalValues;
    } catch (err) {
      console.error("Failed to update settings in database:", err);
      throw err;
    }
  },
};
