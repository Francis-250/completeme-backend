import { prisma } from "../lib/prisma";
import { notificationService } from "./notification.service";

export const newsletterService = {
  subscribe: async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error("INVALID_EMAIL");
    }

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: cleanEmail },
      update: { isActive: true },
      create: { email: cleanEmail, isActive: true },
    });

    // Notify admin of new newsletter subscriber
    try {
      await notificationService.create({
        type: "system",
        title: "New Newsletter Subscriber",
        description: `${cleanEmail} subscribed to the newsletter`,
        href: "/admin",
      });
    } catch {}

    return subscriber;
  },

  getAll: async (options?: { limit?: number; page?: number; activeOnly?: boolean }) => {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const where: any = {};
    if (options?.activeOnly) {
      where.isActive = true;
    }

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return { subscribers, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  unsubscribe: async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });
    if (!existing) {
      throw new Error("SUBSCRIBER_NOT_FOUND");
    }

    return prisma.newsletterSubscriber.update({
      where: { email: cleanEmail },
      data: { isActive: false },
    });
  },

  delete: async (id: string) => {
    return prisma.newsletterSubscriber.delete({
      where: { id },
    });
  },
};
