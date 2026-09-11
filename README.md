# Shop Pulse Backend API

A high-performance, modular e-commerce backend built with **Node.js**, **Express 5**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **Better Auth**.

---

## Table of Contents
- [Interactive API Documentation (Swagger)](#interactive-api-documentation-swagger)
- [Test Credentials](#test-credentials)
- [Test Coupons](#test-coupons)
- [Authentication & Authorization](#authentication--authorization)
- [Comprehensive API Endpoint Reference](#comprehensive-api-endpoint-reference)
  - [1. Authentication (`/api/auth`)](#1-authentication-apiauth)
  - [2. Products & Variants (`/api/products`)](#2-products--variants-apiproducts)
  - [3. Categories (`/api/categories`)](#3-categories-apicategories)
  - [4. Brands (`/api/brands`)](#4-brands-apibrands)
  - [5. Collections (`/api/collections`)](#5-collections-apicollections)
  - [6. Tags (`/api/tags`)](#6-tags-apitags)
  - [7. Shopping Cart (`/api/cart`)](#7-shopping-cart-apicart)
  - [8. Wishlist (`/api/wishlist`)](#8-wishlist-apiwishlist)
  - [9. Orders & Checkout (`/api/orders`)](#9-orders--checkout-apiorders)
  - [10. Discount Coupons (`/api/coupons`)](#10-discount-coupons-apicoupons)
  - [11. Payments (`/api/payments`)](#11-payments-apipayments)
  - [12. Shipments & Fulfillment (`/api/shipments`)](#12-shipments--fulfillment-apishipments)
  - [13. Vendor Profiles (`/api/vendors`)](#13-vendor-profiles-apivendors)
  - [14. User Addresses (`/api/addresses`)](#14-user-addresses-apiaddresses)
  - [15. Reviews & Ratings (`/api/reviews`)](#15-reviews--ratings-apireviews)
- [Getting Started & Local Development](#getting-started--local-development)

---

## Interactive API Documentation (Swagger)

Shop Pulse provides an interactive OpenAPI 3.1 Swagger UI documentation combining all Better Auth identity routes and custom e-commerce service endpoints.

- **Swagger UI Interactive Explorer:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **OpenAPI 3.1 JSON Specification:** [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)

> [!TIP]
> In Swagger UI, you can authenticate either by signing in through `/api/auth/sign-in/email` (which sets session cookies automatically) or by clicking **Authorize** and supplying your session token via `bearerAuth` or `cookieAuth`.

---

## Test Credentials

The database can be seeded with pre-configured accounts across all system roles (`ADMIN`, `VENDOR`, `CUSTOMER`).

> **Default Password for All Seed Accounts:** `Password123!`

| Role | Email | Name | Associated Entity / Profile | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@shoppulse.com` | System Admin | System Administrator | Full platform control (catalog, orders, vendors, payments, shipments, coupons, audits) |
| **VENDOR** | `marcus@auratech.com` | Marcus Vance | **Aura Tech Global** (`aura-tech-global`) | Manage products, variants, images, stock, inventory transactions, and vendor profile |
| **VENDOR** | `elena@velvetvine.com` | Elena Rostova | **Velvet & Vine Boutique** (`velvet-and-vine`) | Manage boutique apparel, lifestyle products, and vendor profile |
| **CUSTOMER** | `lucas.vance@example.com` | Lucas Vance | Pre-seeded with Oregon address, cart, wishlist, and completed order | Place orders, manage cart/wishlist, write reviews, maintain address book |
| **CUSTOMER** | `sophia.m@example.com` | Sophia Martinez | Pre-seeded with SF address, reviews, and active cart items | Place orders, manage cart/wishlist, write reviews, maintain address book |

---

## Test Coupons

Pre-configured discount coupons available for testing order checkout and discount calculations:

| Coupon Code | Discount Type | Value | Min. Order Total | Max. Discount Limit | Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `SUMMER20` | `PERCENTAGE` | **20%** | $50.00 | $100.00 | Active |
| `PULSE100` | `FIXED` | **$100.00** | $500.00 | — | Active |
| `EXPIRED30` | `PERCENTAGE` | **30%** | $30.00 | $50.00 | Expired (Validation test) |

---

## Authentication & Authorization

Shop Pulse uses **Better Auth** with role-based access control (RBAC).

### How to Authenticate Requests

1. **Browser / Web Clients:**
   Send requests with credentials enabled (`credentials: "include"` in `fetch` or `withCredentials: true` in `axios`). The HTTP-only session cookie is handled automatically.

2. **Mobile Apps / REST Clients (Postman, curl, Swagger):**
   Obtain the `token` from `/api/auth/sign-in/email` and include it in the `Authorization` header:
   ```http
   Authorization: Bearer <session_token>
   ```

### Middleware Roles

- `requireAuth`: Verifies that a valid session exists.
- `requireRole("ADMIN")`: Requires the authenticated user to have the `ADMIN` role.
- `requireRole(["ADMIN", "VENDOR"])`: Requires the authenticated user to have either `ADMIN` or `VENDOR` role.

---

## Comprehensive API Endpoint Reference

All custom business endpoints are prefixed with `/api`.

### 1. Authentication (`/api/auth`)

Powered by Better Auth engine:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/sign-up/email` | Public | Register a new user account with `name`, `email`, and `password`. |
| `POST` | `/api/auth/sign-in/email` | Public | Authenticate user with email and password; returns session token & cookie. |
| `POST` | `/api/auth/sign-out` | Authenticated | Terminate the current session and invalidate cookies/tokens. |
| `GET` | `/api/auth/get-session` | Authenticated | Retrieve current session metadata and logged-in user profile with role. |
| `POST` | `/api/auth/two-factor/enable` | Authenticated | Enable two-factor authentication (TOTP/SMS). |
| `POST` | `/api/auth/two-factor/verify` | Authenticated | Verify 2FA one-time code during setup or login challenge. |

---

### 2. Products & Variants (`/api/products`)

Manage product catalog, multi-SKU variants, image galleries, and tags:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products with pagination, search, sorting, category/brand filters, and price range. |
| `GET` | `/api/products/:slug` | Public | Fetch product details by unique slug (includes variants, images, brand, category, tags). |
| `GET` | `/api/products/id/:id` | Public | Fetch product details by ID. |
| `POST` | `/api/products` | `ADMIN`, `VENDOR` | Create a new product. Supports multipart image file uploads (`images` field, max 10). |
| `PATCH` | `/api/products/:id` | `ADMIN`, `VENDOR` | Update product details, specifications, metadata, or upload additional images. |
| `DELETE` | `/api/products/:id` | `ADMIN`, `VENDOR` | Soft delete / remove product from catalog. |
| `POST` | `/api/products/:id/variants` | `ADMIN`, `VENDOR` | Add a new SKU variant (price, compareAtPrice, stockQuantity, weight, attributes JSON). |
| `PATCH` | `/api/products/variants/:variantId` | `ADMIN`, `VENDOR` | Update an existing SKU variant's inventory, price, or attributes. |
| `DELETE` | `/api/products/variants/:variantId` | `ADMIN`, `VENDOR` | Delete an existing product SKU variant. |
| `POST` | `/api/products/:id/tags` | `ADMIN`, `VENDOR` | Attach a tag to a product (`tagId`). |
| `DELETE` | `/api/products/:id/tags` | `ADMIN`, `VENDOR` | Remove a tag from a product (`tagId`). |

---

### 3. Categories (`/api/categories`)

Hierarchical catalog classification:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all categories with subcategory hierarchy and product counts. |
| `GET` | `/api/categories/:slug` | Public | Get single category by slug. |
| `GET` | `/api/categories/id/:id` | Public | Get single category by ID. |
| `POST` | `/api/categories` | `ADMIN` | Create category (supports `parentId` for nesting and single `image` upload). |
| `PATCH` | `/api/categories/:id` | `ADMIN` | Update category name, slug, description, parent, or image. |
| `DELETE` | `/api/categories/:id` | `ADMIN` | Delete category. |

---

### 4. Brands (`/api/brands`)

Manufacturer and brand catalog management:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/brands` | Public | List all active brands. |
| `GET` | `/api/brands/:slug` | Public | Get brand by slug with associated products. |
| `POST` | `/api/brands` | `ADMIN` | Create a new brand (`name`, `slug`, `description`, `logoUrl`). |
| `PATCH` | `/api/brands/:id` | `ADMIN` | Update brand information. |
| `DELETE` | `/api/brands/:id` | `ADMIN` | Delete brand. |

---

### 5. Collections (`/api/collections`)

Curated product sets (e.g. Featured, Summer Deals, New Arrivals):

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/collections` | Public | List all active collections. |
| `GET` | `/api/collections/:slug` | Public | Get collection by slug with linked products. |
| `GET` | `/api/collections/id/:id` | Public | Get collection by ID. |
| `POST` | `/api/collections` | `ADMIN` | Create a new collection (`name`, `slug`, `description`, `startDate`, `endDate`, `image`). |
| `PATCH` | `/api/collections/:id` | `ADMIN` | Update collection details. |
| `DELETE` | `/api/collections/:id` | `ADMIN` | Delete collection. |
| `POST` | `/api/collections/:id/products` | `ADMIN` | Add products to collection (`productIds: string[]`). |
| `DELETE` | `/api/collections/:id/products` | `ADMIN` | Remove products from collection (`productIds: string[]`). |
| `PATCH` | `/api/collections/:id/products/sort`| `ADMIN` | Reorder products inside collection (`items: { productId, sortOrder }[]`). |

---

### 6. Tags (`/api/tags`)

Descriptive keywords and merchandising badges:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tags` | Public | List all available tags. |
| `GET` | `/api/tags/:slug` | Public | Get tag by slug with associated products. |
| `GET` | `/api/tags/id/:id` | Public | Get tag by ID. |
| `POST` | `/api/tags` | `ADMIN` | Create a new tag (`name`, `slug`). |
| `PATCH` | `/api/tags/:id` | `ADMIN` | Update tag name or slug. |
| `DELETE` | `/api/tags/:id` | `ADMIN` | Delete tag. |

---

### 7. Shopping Cart (`/api/cart`)

User shopping cart management:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Authenticated | Retrieve the authenticated user's cart items with product and variant details. |
| `GET` | `/api/cart/summary` | Authenticated | Compute cart totals (item count, subtotal, estimated tax and shipping). |
| `POST` | `/api/cart` | Authenticated | Add an item to cart (`variantId`, `quantity`). |
| `PATCH` | `/api/cart/:variantId`| Authenticated | Update item quantity for a variant in cart (`quantity`). |
| `DELETE` | `/api/cart/:variantId`| Authenticated | Remove specific item from cart. |
| `DELETE` | `/api/cart` | Authenticated | Clear all items from cart. |

---

### 8. Wishlist (`/api/wishlist`)

Saved favorite items:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Authenticated | Get all items saved in the user's wishlist. |
| `GET` | `/api/wishlist/check/:productId` | Authenticated | Check whether a specific product is currently saved in user's wishlist. |
| `POST` | `/api/wishlist` | Authenticated | Add product to wishlist (`productId`). |
| `DELETE` | `/api/wishlist/:productId` | Authenticated | Remove product from wishlist. |
| `DELETE` | `/api/wishlist` | Authenticated | Clear entire wishlist. |

---

### 9. Orders & Checkout (`/api/orders`)

Order processing, status lifecycle, and order management:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | Authenticated | List orders. Customers see their own orders; Admins view all orders. |
| `GET` | `/api/orders/stats` | `ADMIN` | Get high-level order statistics (revenue, total count, status breakdown). |
| `GET` | `/api/orders/:id` | Authenticated | Get order details (items, addresses, payment status, shipment tracking). |
| `POST` | `/api/orders` | Authenticated | Create a new order (`shippingAddressId`, `billingAddressId`, `items`, `couponCode`). |
| `PATCH` | `/api/orders/:id` | `ADMIN`, `VENDOR` | Update order status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`). |
| `POST` | `/api/orders/:id/cancel` | Authenticated | Cancel order (eligible before shipment). |

---

### 10. Discount Coupons (`/api/coupons`)

Promotion engine & coupon code validation:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/coupons/validate` | Authenticated | Validate coupon applicability against a given cart subtotal. Returns discount amount. |
| `GET` | `/api/coupons` | `ADMIN` | List all coupons with usage statistics. |
| `GET` | `/api/coupons/:code` | Public | Check coupon code validity and terms. |
| `GET` | `/api/coupons/id/:id` | `ADMIN` | Get coupon by ID. |
| `POST` | `/api/coupons` | `ADMIN` | Create coupon (`code`, `discountType`, `discountValue`, `minOrderAmount`, `maxDiscount`, `startDate`, `endDate`, `usageLimit`). |
| `PATCH` | `/api/coupons/:id` | `ADMIN` | Update coupon terms or active status. |
| `DELETE` | `/api/coupons/:id` | `ADMIN` | Delete coupon. |

---

### 11. Payments (`/api/payments`)

Payment records and refund tracking:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments` | Authenticated | List payments for user's orders (or all payments for Admin). |
| `GET` | `/api/payments/:id` | Authenticated | Get payment details by payment ID. |
| `GET` | `/api/payments/transaction/:transactionId` | Authenticated | Look up payment by external transaction/gateway ID. |
| `POST` | `/api/payments` | `ADMIN` | Record new payment (`orderId`, `amount`, `currency`, `provider`, `transactionId`, `status`). |
| `PATCH` | `/api/payments/:id` | `ADMIN` | Update payment status (`PAID`, `REFUNDED`, `FAILED`). |
| `DELETE` | `/api/payments/:id` | `ADMIN` | Delete payment record. |

---

### 12. Shipments & Fulfillment (`/api/shipments`)

Carrier fulfillment and tracking:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shipments` | Authenticated | List shipments for user's orders (or all shipments for Admin). |
| `GET` | `/api/shipments/:id` | Authenticated | Get shipment details by ID. |
| `GET` | `/api/shipments/tracking/:trackingNumber` | Authenticated | Look up shipment status by carrier tracking number. |
| `POST` | `/api/shipments` | `ADMIN` | Create shipment fulfillment record (`orderId`, `carrier`, `trackingNumber`, `estimatedDelivery`). |
| `PATCH` | `/api/shipments/:id` | `ADMIN` | Update shipment tracking status (`LABEL_CREATED`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`). |
| `DELETE` | `/api/shipments/:id` | `ADMIN` | Delete shipment record. |

---

### 13. Vendor Profiles (`/api/vendors`)

Multi-vendor storefront management:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vendors` | Public | List all active vendor store profiles. |
| `GET` | `/api/vendors/me` | Authenticated | Get currently authenticated vendor's own profile. |
| `GET` | `/api/vendors/:slug` | Public | Get public vendor store page by slug. |
| `GET` | `/api/vendors/id/:id` | Public | Get vendor profile by ID. |
| `POST` | `/api/vendors` | `ADMIN`, `VENDOR` | Register a new vendor profile (`companyName`, `slug`, `description`, `logo`). |
| `PATCH` | `/api/vendors/:id` | `ADMIN`, `VENDOR` | Update vendor profile details or brand logo. |
| `DELETE` | `/api/vendors/:id` | `ADMIN` | Deactivate / delete vendor profile. |

---

### 14. User Addresses (`/api/addresses`)

Customer address book for shipping and billing:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/addresses` | Authenticated | List all saved addresses for current user. |
| `GET` | `/api/addresses/:id` | Authenticated | Get address details by ID. |
| `POST` | `/api/addresses` | Authenticated | Create a new address (`addressType`, `addressLine1`, `city`, `state`, `postalCode`, `country`, `isDefault`). |
| `PATCH` | `/api/addresses/:id` | Authenticated | Update an existing address. |
| `DELETE` | `/api/addresses/:id` | Authenticated | Delete an address. |
| `PATCH` | `/api/addresses/:id/default` | Authenticated | Designate an address as default for its type (`SHIPPING` or `BILLING`). |

---

### 15. Reviews & Ratings (`/api/reviews`)

Product customer reviews and rating calculations:

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews` | Public | List approved reviews (supports filtering by `productId`). |
| `GET` | `/api/reviews/:id` | Public | Get single review by ID. |
| `POST` | `/api/reviews` | Authenticated | Post review for a product (`productId`, `rating` [1-5], `title`, `comment`). Auto-updates product average rating. |
| `PATCH` | `/api/reviews/:id` | Authenticated | Edit user's own review. |
| `DELETE` | `/api/reviews/:id` | Authenticated | Delete review. |

---

## Getting Started & Local Development

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** database instance
- **npm** or **pnpm**

### Installation

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in `backend/`:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/shoppulse?schema=public"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
BETTER_AUTH_SECRET="your-secure-random-secret-key-at-least-32-chars"
BETTER_AUTH_URL="http://localhost:5000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Database Setup & Seeding

```bash
# Push Prisma schema to PostgreSQL database
npm run db:push

# Seed database with all 27 models, 4+ images per product, and test accounts
npm run db:seed
```

### Start Development Server

```bash
npm run dev
```

The server will start listening at:
- **API Base:** [http://localhost:5000/api](http://localhost:5000/api)
- **Swagger Documentation:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **OpenAPI 3.1 JSON:** [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)
