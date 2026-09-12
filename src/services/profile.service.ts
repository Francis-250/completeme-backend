import { prisma } from "../lib/prisma";

export const profileService = {
  getProfile: async (userId?: string) => {
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!user) {
      // Default to the first admin user
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
    }
    if (!user) {
      // Fallback to any user
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return {
        id: "admin-default",
        firstName: "Francois",
        lastName: "Admin",
        email: "admin@shoppulse.com",
        phone: "+15551001001",
        role: "Store Owner",
        bio: "Running Shop Pulse — building a calm, considered store for everyday essentials.",
        avatarUrl: "",
      };
    }

    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts[0] || "Admin";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phoneNumber || "",
      role: user.role === "ADMIN" ? "Store Owner" : user.role || "Administrator",
      bio: "Running Shop Pulse — building a calm, considered store for everyday essentials.",
      avatarUrl: user.image || "",
    };
  },

  updateProfile: async (
    userId: string | undefined,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
      bio?: string;
    },
  ) => {
    let targetId = userId;
    if (!targetId) {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      targetId = admin?.id;
    }

    if (!targetId) {
      throw new Error("USER_NOT_FOUND");
    }

    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined || data.lastName !== undefined) {
      const current = await prisma.user.findUnique({ where: { id: targetId } });
      const currentParts = (current?.name || "").split(" ");
      const fName = data.firstName !== undefined ? data.firstName : currentParts[0] || "";
      const lName =
        data.lastName !== undefined
          ? data.lastName
          : currentParts.slice(1).join(" ") || "";
      updateData.name = `${fName} ${lName}`.trim();
    }

    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.phone !== undefined) updateData.phoneNumber = data.phone;
    if (data.avatarUrl !== undefined) updateData.image = data.avatarUrl;

    await prisma.user.update({
      where: { id: targetId },
      data: updateData,
    });

    return profileService.getProfile(targetId);
  },
};
