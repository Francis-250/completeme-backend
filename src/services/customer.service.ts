import { prisma } from "../lib/prisma";

export interface CustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
  isActive: boolean;
  address?: string;
}

export const customerService = {
  getAll: async (filters: { search?: string; limit?: number } = {}): Promise<CustomerSummary[]> => {
    const where: Record<string, unknown> = {
      OR: [
        { role: "CUSTOMER" },
        { role: null },
        { role: { not: "ADMIN" } },
      ],
    };

    if (filters.search) {
      const q = filters.search.trim();
      where.AND = [
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phoneNumber: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        addresses: {
          orderBy: { isDefault: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit || 100,
    });

    return users.map((u) => {
      const nameParts = (u.name || "").trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "";

      const totalSpent = u.orders.reduce(
        (sum, ord) => sum + Number(ord.totalAmount || 0),
        0,
      );

      const defaultAddr = u.addresses[0];
      const addressStr = defaultAddr
        ? `${defaultAddr.addressLine1}${defaultAddr.city ? `, ${defaultAddr.city}` : ""}${defaultAddr.country ? `, ${defaultAddr.country}` : ""}`
        : undefined;

      return {
        id: u.id,
        firstName,
        lastName,
        name: u.name,
        email: u.email,
        phone: u.phoneNumber || undefined,
        avatarUrl: u.image || undefined,
        orderCount: u.orders.length,
        totalSpent,
        lastOrderAt: u.orders[0]?.createdAt?.toISOString(),
        createdAt: u.createdAt.toISOString(),
        isActive: !u.banned,
        address: addressStr,
      };
    });
  },

  getById: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                variant: {
                  include: { product: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        addresses: true,
        reviews: true,
      },
    });

    if (!user) return null;

    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "";

    const totalSpent = user.orders.reduce(
      (sum, ord) => sum + Number(ord.totalAmount || 0),
      0,
    );

    return {
      id: user.id,
      firstName,
      lastName,
      name: user.name,
      email: user.email,
      phone: user.phoneNumber || undefined,
      avatarUrl: user.image || undefined,
      orderCount: user.orders.length,
      totalSpent,
      lastOrderAt: user.orders[0]?.createdAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      isActive: !user.banned,
      orders: user.orders,
      addresses: user.addresses,
    };
  },

  create: async (data: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
  }) => {
    const fullName =
      data.name ||
      `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
      data.email.split("@")[0];

    const customerId = `usr-cust-${Date.now()}`;

    const user = await prisma.user.create({
      data: {
        id: customerId,
        name: fullName,
        email: data.email.toLowerCase(),
        phoneNumber: data.phone || null,
        role: "CUSTOMER",
        banned: data.isActive === false,
      },
    });

    if (data.address) {
      await prisma.userAddress.create({
        data: {
          userId: user.id,
          addressType: "SHIPPING",
          addressLine1: data.address,
          city: "Springfield",
          state: "OR",
          postalCode: "97477",
          country: "United States",
          isDefault: true,
        },
      });
    }

    return customerService.getById(user.id);
  },

  update: async (
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      isActive?: boolean;
    },
  ) => {
    const updateData: Record<string, unknown> = {};

    if (data.name) {
      updateData.name = data.name;
    } else if (data.firstName !== undefined || data.lastName !== undefined) {
      const existing = await prisma.user.findUnique({ where: { id } });
      const currentParts = (existing?.name || "").split(" ");
      const fName = data.firstName !== undefined ? data.firstName : currentParts[0] || "";
      const lName =
        data.lastName !== undefined
          ? data.lastName
          : currentParts.slice(1).join(" ") || "";
      updateData.name = `${fName} ${lName}`.trim();
    }

    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.phone !== undefined) updateData.phoneNumber = data.phone;
    if (data.isActive !== undefined) updateData.banned = !data.isActive;

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (data.address) {
      const existingAddr = await prisma.userAddress.findFirst({
        where: { userId: id, isDefault: true },
      });
      if (existingAddr) {
        await prisma.userAddress.update({
          where: { id: existingAddr.id },
          data: { addressLine1: data.address },
        });
      } else {
        await prisma.userAddress.create({
          data: {
            userId: id,
            addressType: "SHIPPING",
            addressLine1: data.address,
            city: "Springfield",
            state: "OR",
            postalCode: "97477",
            country: "United States",
            isDefault: true,
          },
        });
      }
    }

    return customerService.getById(id);
  },

  delete: async (id: string) => {
    await prisma.user.delete({
      where: { id },
    });
    return { success: true };
  },
};
