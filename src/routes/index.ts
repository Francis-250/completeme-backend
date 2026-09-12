import { Router } from "express";

import tagsRoutes from "./tags.routes";
import brandRoutes from "./brand.routes";
import categoryRoutes from "./category.routes";
import collectionRoutes from "./collection.routes";
import productRoutes from "./product.routes";
import reviewRoutes from "./review.routes";
import wishlistRoutes from "./wishlist.routes";
import cartRoutes from "./cart.routes";
import couponRoutes from "./coupon.routes";
import orderRoutes from "./order.routes";
import paymentRoutes from "./payment.routes";
import shipmentRoutes from "./shipment.routes";
import vendorProfileRoutes from "./vendor-profile.routes";
import userAddressRoutes from "./user-address.routes";
import checkoutRoutes from "./checkout.routes";
import mediaRoutes from "./media.routes";
import customerRoutes from "./customer.routes";
import settingsRoutes from "./settings.routes";
import profileRoutes from "./profile.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/tags", tagsRoutes);
router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/collections", collectionRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/shipments", shipmentRoutes);
router.use("/vendors", vendorProfileRoutes);
router.use("/addresses", userAddressRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/media", mediaRoutes);
router.use("/customers", customerRoutes);
router.use("/settings", settingsRoutes);
router.use("/profile", profileRoutes);
router.use("/notifications", notificationRoutes);

export default router;