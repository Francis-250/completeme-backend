import { prisma } from "../lib/prisma";

export const profileService = {
  getProfile: async (userId?: string) => {
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }

    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phoneNumber || "",
      role: user.role || "CUSTOMER",
      bio: "",
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
    const targetId = userId;
    if (!targetId) {
      throw new Error("UNAUTHORIZED");
    }

    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined || data.lastName !== undefined) {
      const current = await prisma.user.findUnique({ where: { id: targetId } });
      const currentParts = (current?.name || "").split(" ");
      const fName =
        data.firstName !== undefined ? data.firstName : currentParts[0] || "";
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
