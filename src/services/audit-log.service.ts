import { prisma } from "../lib/prisma";

export const auditLogService = {
  log: async (data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
  }) => {
    const log = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: data.ipAddress,
      },
    });

    return log;
  },

  getAll: async (filters: {
    userId?: string;
    entity?: string;
    action?: string;
    entityId?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const { userId, entity, action, entityId, page = 1, limit = 50 } = filters;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (entityId) where.entityId = entityId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getByEntity: async (entity: string, entityId: string) => {
    const logs = await prisma.auditLog.findMany({
      where: { entity, entityId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return logs;
  },
};