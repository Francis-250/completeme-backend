import { prisma } from "../lib/prisma";

export type NotificationType = "stock" | "order" | "review" | "user" | "system";

export const notificationService = {
  getAll: async (options?: { limit?: number; unreadOnly?: boolean; type?: string }) => {
    const where: any = {};
    if (options?.unreadOnly) {
      where.read = false;
    }
    if (options?.type && options.type !== "all") {
      where.type = options.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit ?? 50,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { read: false } }),
    ]);

    return { notifications, total, unreadCount };
  },

  create: async (data: {
    type: NotificationType;
    title: string;
    description: string;
    href?: string;
  }) => {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const existing = await prisma.notification.findFirst({
      where: {
        type: data.type,
        title: data.title,
        createdAt: { gte: twelveHoursAgo },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        href: data.href,
        read: false,
      },
    });
  },

  markAsRead: async (id: string) => {
    return prisma.notification.updateMany({
      where: { id },
      data: { read: true },
    });
  },

  markAllAsRead: async () => {
    return prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  },

  delete: async (id: string) => {
    return prisma.notification.deleteMany({
      where: { id },
    });
  },

  deleteAll: async () => {
    return prisma.notification.deleteMany({});
  },
};
