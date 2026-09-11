import { tagPaths } from "./tags";
import { brandPaths } from "./brands";
import { categoryPaths } from "./categories";
import { collectionPaths } from "./collections";
import { productPaths } from "./products";
import { reviewPaths } from "./reviews";
import { wishlistPaths } from "./wishlist";
import { cartPaths } from "./cart";
import { couponPaths } from "./coupons";
import { orderPaths } from "./orders";
import { paymentPaths } from "./payments";
import { shipmentPaths } from "./shipments";
import { vendorPaths } from "./vendors";
import { addressPaths } from "./addresses";

export const customTags = [
  {
    name: "Products",
    description: "Product catalog, variants, pricing, and tag management",
  },
  {
    name: "Categories",
    description: "Hierarchical product categories",
  },
  {
    name: "Brands",
    description: "Manufacturer and product brand catalog",
  },
  {
    name: "Collections",
    description: "Featured and seasonal product collections",
  },
  {
    name: "Tags",
    description: "Metadata labels for filtering and tagging products",
  },
  {
    name: "Cart",
    description: "Shopping cart items and calculations",
  },
  {
    name: "Wishlist",
    description: "Customer saved wishlist items",
  },
  {
    name: "Orders",
    description: "Checkout order creation, order history, and lifecycle status",
  },
  {
    name: "Payments",
    description: "Payment transaction tracking and status management",
  },
  {
    name: "Shipments",
    description: "Fulfillment shipping tracking and logistics",
  },
  {
    name: "Coupons",
    description: "Discount vouchers and promotions validation",
  },
  {
    name: "Vendors",
    description: "Marketplace vendor profiles and stores",
  },
  {
    name: "Addresses",
    description: "Customer delivery and billing address book",
  },
  {
    name: "Reviews",
    description: "Customer product reviews and ratings",
  },
];

export const customPaths = {
  ...tagPaths,
  ...brandPaths,
  ...categoryPaths,
  ...collectionPaths,
  ...productPaths,
  ...reviewPaths,
  ...wishlistPaths,
  ...cartPaths,
  ...couponPaths,
  ...orderPaths,
  ...paymentPaths,
  ...shipmentPaths,
  ...vendorPaths,
  ...addressPaths,
};
