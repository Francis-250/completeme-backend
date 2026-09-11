import { Router } from "express";

import tagsRoutes from "./tags.routes";
import brandRoutes from "./brand.routes";
import collectionRoutes from "./collection.routes";
import cartRoutes from "./cart.routes";
import productRoutes from "./product.routes";
import checkoutRoutes from "./checkout.routes";
import categoryRoutes from "./category.routes";
import orderRoutes from "./order.routes";
import reviewRoutes from "./review.routes";
import wishlistRoutes from "./wishlist.routes";

const router = Router();

router.use("/tags", tagsRoutes);
router.use("/brands", brandRoutes);
router.use("/collections", collectionRoutes);
router.use("/cart", cartRoutes);
router.use("/products", productRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);

export default router;
