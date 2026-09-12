import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { notificationService } from "../services/notification.service";

export async function checkAlerts() {
  try {
    // 1. Stock alerts
    // Read low stock threshold from store settings if available
    let lowStockThreshold = 10;
    try {
      const setting = await prisma.storeSetting.findUnique({ where: { id: "default" } });
      if (setting && setting.values && typeof setting.values === "object") {
        const val = Number((setting.values as any).lowStockThreshold);
        if (!isNaN(val) && val > 0) {
          lowStockThreshold = val;
        }
      }
    } catch {}

    const variants = await prisma.productVariant.findMany({
      where: {
        stockQuantity: { lte: lowStockThreshold },
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
      take: 20,
    });

    for (const v of variants) {
      if (!v.product) continue;
      if (v.stockQuantity === 0) {
        await notificationService.create({
          type: "stock",
          title: `Out of stock: ${v.product.name} (${v.sku})`,
          description: "Inventory is completely depleted. Restock immediately to resume sales.",
          href: "/admin/products",
        });
      } else {
        await notificationService.create({
          type: "stock",
          title: `Low stock alert: ${v.product.name} (${v.sku})`,
          description: `Only ${v.stockQuantity} unit(s) remaining in stock (threshold: ${lowStockThreshold}).`,
          href: "/admin/products",
        });
      }
    }

    // 2. Pending orders alert
    const pendingOrdersCount = await prisma.order.count({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });

    if (pendingOrdersCount > 0) {
      await notificationService.create({
        type: "order",
        title: `${pendingOrdersCount} order(s) awaiting processing`,
        description: `You have ${pendingOrdersCount} pending or processing order(s) that need fulfillment.`,
        href: "/admin/orders",
      });
    }

    // 3. Expiring coupons alert (within next 48 hours)
    const now = new Date();
    const in48Hours = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const expiringCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        endDate: {
          gt: now,
          lte: in48Hours,
        },
      },
      take: 5,
    });

    for (const c of expiringCoupons) {
      await notificationService.create({
        type: "system",
        title: `Coupon "${c.code}" expires soon`,
        description: `Coupon ${c.code} is scheduled to expire on ${c.endDate.toLocaleDateString()}.`,
        href: "/admin/coupons",
      });
    }

    // 4. Recent reviews alert (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReviews = await prisma.productReview.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
      },
      include: {
        product: { select: { name: true } },
      },
      take: 5,
    });

    for (const r of recentReviews) {
      await notificationService.create({
        type: "review",
        title: `New ${r.rating}-star review on ${r.product?.name || "product"}`,
        description: r.title
          ? `"${r.title}" — ${(r.comment || "").slice(0, 60)}...`
          : (r.comment || "").slice(0, 80) || `Rating: ${r.rating}/5 stars`,
        href: "/admin/reviews",
      });
    }
  } catch (error) {
    console.error("Alert cron execution error:", error);
  }
}

export function initAlertCron() {
  console.log("⏰ Initializing alert cron job...");

  // Run alert checks every 10 minutes
  cron.schedule("*/10 * * * *", () => {
    checkAlerts().catch((err) => console.error("Cron check failed:", err));
  });

  // Run immediately on server startup
  checkAlerts().catch((err) => console.error("Initial alert check failed:", err));
}
