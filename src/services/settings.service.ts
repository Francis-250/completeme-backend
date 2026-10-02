import { prisma } from "../lib/prisma";

export const settingsService = {
  getSettings: async (): Promise<Record<string, any>> => {
    try {
      const record = await prisma.storeSetting.findUnique({
        where: { id: "default" },
      });

      if (!record || !record.values || typeof record.values !== "object") {
        return {};
      }

      return record.values as Record<string, any>;
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

      return (updated.values as Record<string, any>) || merged;
    } catch (err) {
      console.error("Failed to update settings in database:", err);
      throw err;
    }
  },
};
