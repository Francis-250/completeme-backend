import { prisma } from "../lib/prisma";
import { notificationService } from "./notification.service";

export interface CreateInquiryDto {
  name: string;
  email: string;
  orderNumber?: string;
  subject?: string;
  message: string;
}

export const contactService = {
  createInquiry: async (data: CreateInquiryDto) => {
    if (!data.name || !data.email || !data.message) {
      throw new Error("NAME_EMAIL_MESSAGE_REQUIRED");
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        orderNumber: data.orderNumber?.trim() || null,
        subject: data.subject?.trim() || "general",
        message: data.message.trim(),
        status: "PENDING",
      },
    });

    // Notify admin
    try {
      await notificationService.create({
        type: "system",
        title: `Customer Message: ${inquiry.subject}`,
        description: `New message from ${inquiry.name} (${inquiry.email})`,
        href: "/admin/notifications",
      });
    } catch {
      // Non-blocking notification failure
    }

    return inquiry;
  },

  getAllInquiries: async (options: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const { status, page = 1, limit = 20 } = options;
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    return {
      inquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  updateStatus: async (id: string, status: string) => {
    return prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });
  },
};
