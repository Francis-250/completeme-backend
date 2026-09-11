export const schemas = {
  // Generic responses
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Operation completed successfully" },
    },
    required: ["success", "message"],
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "An error occurred while processing the request" },
    },
    required: ["success", "message"],
  },

  // Tag schemas
  Tag: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
      name: { type: "string", example: "Summer 2026" },
      slug: { type: "string", example: "summer-2026" },
      createdAt: { type: "string", format: "date-time" },
    },
    required: ["id", "name", "slug", "createdAt"],
  },
  CreateTagInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Electronics", description: "Unique name for the tag" },
    },
    required: ["name"],
  },
  UpdateTagInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Home Electronics" },
    },
  },

  // Brand schemas
  Brand: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "Apple" },
      slug: { type: "string", example: "apple" },
      logoUrl: { type: "string", nullable: true, format: "uri", example: "https://res.cloudinary.com/.../brand.png" },
      description: { type: "string", nullable: true, example: "Premium consumer electronics and software" },
      createdAt: { type: "string", format: "date-time" },
    },
    required: ["id", "name", "slug", "createdAt"],
  },
  CreateBrandInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Sony" },
      description: { type: "string", example: "Electronics and gaming products" },
      logo: { type: "string", format: "binary", description: "Brand logo image file (JPEG, PNG, WebP)" },
    },
    required: ["name"],
  },
  UpdateBrandInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Sony Corporation" },
      description: { type: "string", example: "Updated description" },
      logo: { type: "string", format: "binary" },
    },
  },

  // Category schemas
  Category: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      parentId: { type: "string", format: "uuid", nullable: true },
      name: { type: "string", example: "Smartphones" },
      slug: { type: "string", example: "smartphones" },
      description: { type: "string", nullable: true, example: "Mobile phones and cellular accessories" },
      createdAt: { type: "string", format: "date-time" },
      parent: { $ref: "#/components/schemas/Category", nullable: true },
      children: {
        type: "array",
        items: { $ref: "#/components/schemas/Category" },
      },
    },
    required: ["id", "name", "slug", "createdAt"],
  },
  CreateCategoryInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Smartphones" },
      description: { type: "string", example: "Smartphones category" },
      parentId: { type: "string", format: "uuid", description: "Parent category UUID for sub-categories" },
      image: { type: "string", format: "binary", description: "Category banner/thumbnail image" },
    },
    required: ["name"],
  },
  UpdateCategoryInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Mobile Devices" },
      description: { type: "string", example: "Updated description" },
      parentId: { type: "string", format: "uuid" },
      image: { type: "string", format: "binary" },
    },
  },

  // Collection schemas
  Collection: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "Black Friday 2026" },
      slug: { type: "string", example: "black-friday-2026" },
      description: { type: "string", nullable: true, example: "Annual holiday discount collection" },
      imageUrl: { type: "string", nullable: true, format: "uri" },
      isActive: { type: "boolean", default: true },
      startDate: { type: "string", format: "date-time", nullable: true },
      endDate: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      products: {
        type: "array",
        items: {
          type: "object",
          properties: {
            collectionId: { type: "string" },
            productId: { type: "string" },
            sortOrder: { type: "integer" },
            product: { $ref: "#/components/schemas/Product" },
          },
        },
      },
    },
    required: ["id", "name", "slug", "isActive", "createdAt"],
  },
  CreateCollectionInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "Winter Sale" },
      description: { type: "string", example: "Top winter season picks" },
      isActive: { type: "boolean", default: true },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
      image: { type: "string", format: "binary" },
    },
    required: ["name"],
  },
  UpdateCollectionInput: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      isActive: { type: "boolean" },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
      image: { type: "string", format: "binary" },
    },
  },
  AddProductToCollectionInput: {
    type: "object",
    properties: {
      productId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
      sortOrder: { type: "integer", default: 0, example: 1 },
    },
    required: ["productId"],
  },
  RemoveProductFromCollectionInput: {
    type: "object",
    properties: {
      productId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
    },
    required: ["productId"],
  },
  SortCollectionProductInput: {
    type: "object",
    properties: {
      productId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
      sortOrder: { type: "integer", example: 5 },
    },
    required: ["productId", "sortOrder"],
  },

  // Product schemas
  ProductImage: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      productId: { type: "string", format: "uuid" },
      url: { type: "string", format: "uri", example: "https://res.cloudinary.com/.../img.jpg" },
      altText: { type: "string", nullable: true },
      sortOrder: { type: "integer", default: 0 },
      isPrimary: { type: "boolean", default: false },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "productId", "url"],
  },
  ProductVariant: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      productId: { type: "string", format: "uuid" },
      sku: { type: "string", example: "PROD-VAR-001" },
      price: { type: "number", example: 199.99 },
      compareAtPrice: { type: "number", nullable: true, example: 249.99 },
      stockQuantity: { type: "integer", example: 50 },
      weight: { type: "number", nullable: true, example: 0.5 },
      attributes: {
        type: "object",
        additionalProperties: true,
        example: { color: "Space Gray", storage: "256GB" },
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "productId", "sku", "price", "stockQuantity"],
  },
  Product: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "iPhone 16 Pro" },
      slug: { type: "string", example: "iphone-16-pro" },
      description: { type: "string", nullable: true, example: "The latest smartphone with titanium build" },
      shortDescription: { type: "string", nullable: true, example: "Pro camera, titanium design" },
      metaTitle: { type: "string", nullable: true },
      metaDescription: { type: "string", nullable: true },
      categoryId: { type: "string", format: "uuid", nullable: true },
      brandId: { type: "string", format: "uuid", nullable: true },
      vendorId: { type: "string", format: "uuid", nullable: true },
      isActive: { type: "boolean", default: true },
      averageRating: { type: "number", example: 4.8 },
      reviewCount: { type: "integer", example: 124 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      variants: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductVariant" },
      },
      images: {
        type: "array",
        items: { $ref: "#/components/schemas/ProductImage" },
      },
      category: { $ref: "#/components/schemas/Category", nullable: true },
      brand: { $ref: "#/components/schemas/Brand", nullable: true },
      vendor: { $ref: "#/components/schemas/VendorProfile", nullable: true },
      tags: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "string" },
            tagId: { type: "string" },
            tag: { $ref: "#/components/schemas/Tag" },
          },
        },
      },
    },
    required: ["id", "name", "slug", "isActive", "averageRating", "reviewCount", "createdAt", "updatedAt"],
  },
  CreateProductInput: {
    type: "object",
    properties: {
      name: { type: "string", example: "iPhone 16 Pro" },
      description: { type: "string", example: "Detailed product description" },
      shortDescription: { type: "string", example: "Short summary of product" },
      metaTitle: { type: "string", example: "Buy iPhone 16 Pro" },
      metaDescription: { type: "string", example: "Best deals on iPhone 16 Pro" },
      categoryId: { type: "string", format: "uuid" },
      brandId: { type: "string", format: "uuid" },
      isActive: { type: "boolean", default: true },
      variants: {
        type: "string",
        description: "JSON string representing an array of variant objects: [{ sku, price, compareAtPrice, stockQuantity, weight, attributes }]",
        example: JSON.stringify([
          {
            sku: "IP16-PRO-256-BLK",
            price: 999.99,
            compareAtPrice: 1099.99,
            stockQuantity: 25,
            weight: 0.2,
            attributes: { color: "Black Titanium", storage: "256GB" },
          },
        ]),
      },
      images: {
        type: "array",
        items: { type: "string", format: "binary" },
        description: "Upload up to 10 product images",
      },
    },
    required: ["name", "variants"],
  },
  UpdateProductInput: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
      shortDescription: { type: "string" },
      metaTitle: { type: "string" },
      metaDescription: { type: "string" },
      categoryId: { type: "string", format: "uuid" },
      brandId: { type: "string", format: "uuid" },
      isActive: { type: "boolean" },
      variants: { type: "string", description: "JSON string of variant array" },
      images: {
        type: "array",
        items: { type: "string", format: "binary" },
      },
    },
  },
  CreateVariantInput: {
    type: "object",
    properties: {
      sku: { type: "string", example: "PROD-VAR-512" },
      price: { type: "number", example: 1199.99 },
      compareAtPrice: { type: "number", example: 1299.99 },
      stockQuantity: { type: "integer", example: 15 },
      weight: { type: "number", example: 0.25 },
      attributes: {
        type: "string",
        description: "JSON string or object containing variant attributes, e.g. { color: 'Blue', storage: '512GB' }",
        example: "{\"color\":\"Blue\",\"storage\":\"512GB\"}",
      },
      images: {
        type: "array",
        items: { type: "string", format: "binary" },
      },
    },
    required: ["sku", "price", "stockQuantity"],
  },
  UpdateVariantInput: {
    type: "object",
    properties: {
      sku: { type: "string" },
      price: { type: "number" },
      compareAtPrice: { type: "number" },
      stockQuantity: { type: "integer" },
      weight: { type: "number" },
      attributes: { type: "string" },
      images: {
        type: "array",
        items: { type: "string", format: "binary" },
      },
    },
  },
  AddTagToProductInput: {
    type: "object",
    properties: {
      tagId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
    },
    required: ["tagId"],
  },

  // Review schemas
  ProductReview: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      productId: { type: "string", format: "uuid" },
      userId: { type: "string" },
      rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
      title: { type: "string", nullable: true, example: "Excellent quality!" },
      comment: { type: "string", nullable: true, example: "Exceeded my expectations, fast shipping too." },
      isVerified: { type: "boolean", default: false },
      isApproved: { type: "boolean", default: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      user: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          image: { type: "string", nullable: true },
        },
      },
    },
    required: ["id", "productId", "userId", "rating", "createdAt", "updatedAt"],
  },
  CreateReviewInput: {
    type: "object",
    properties: {
      productId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
      rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
      title: { type: "string", example: "Superb product!" },
      comment: { type: "string", example: "Works like a charm. Highly recommended." },
    },
    required: ["productId", "rating"],
  },
  UpdateReviewInput: {
    type: "object",
    properties: {
      rating: { type: "integer", minimum: 1, maximum: 5 },
      title: { type: "string" },
      comment: { type: "string" },
      isApproved: { type: "boolean", description: "Admin-only flag to approve/reject review" },
    },
  },

  // Wishlist schemas
  WishlistItem: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      userId: { type: "string" },
      productId: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" },
      product: { $ref: "#/components/schemas/Product" },
    },
    required: ["id", "userId", "productId", "createdAt"],
  },
  AddToWishlistInput: {
    type: "object",
    properties: {
      productId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
    },
    required: ["productId"],
  },

  // Cart schemas
  CartItem: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      userId: { type: "string" },
      variantId: { type: "string", format: "uuid" },
      quantity: { type: "integer", example: 2 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      variant: {
        type: "object",
        properties: {
          id: { type: "string" },
          sku: { type: "string" },
          price: { type: "number" },
          stockQuantity: { type: "integer" },
          attributes: { type: "object" },
          product: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              slug: { type: "string" },
              images: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductImage" },
              },
            },
          },
        },
      },
    },
    required: ["id", "userId", "variantId", "quantity"],
  },
  CartSummary: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/CartItem" },
      },
      totalItems: { type: "integer", example: 3 },
      totalQuantity: { type: "integer", example: 5 },
      subtotal: { type: "number", example: 249.95 },
    },
    required: ["items", "totalItems", "totalQuantity", "subtotal"],
  },
  AddToCartInput: {
    type: "object",
    properties: {
      variantId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
      quantity: { type: "integer", minimum: 1, example: 1 },
    },
    required: ["variantId", "quantity"],
  },
  UpdateCartInput: {
    type: "object",
    properties: {
      quantity: { type: "integer", minimum: 1, example: 3 },
    },
    required: ["quantity"],
  },

  // Coupon schemas
  Coupon: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      code: { type: "string", example: "SAVE20" },
      discountType: {
        type: "string",
        enum: ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"],
        example: "PERCENTAGE",
      },
      discountValue: { type: "number", example: 20 },
      minOrderAmount: { type: "number", nullable: true, example: 50 },
      maxDiscount: { type: "number", nullable: true, example: 100 },
      usageLimit: { type: "integer", nullable: true, example: 500 },
      usedCount: { type: "integer", default: 0 },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
      isActive: { type: "boolean", default: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "code", "discountType", "discountValue", "startDate", "endDate", "isActive"],
  },
  CreateCouponInput: {
    type: "object",
    properties: {
      code: { type: "string", example: "WELCOME10" },
      discountType: {
        type: "string",
        enum: ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"],
        example: "PERCENTAGE",
      },
      discountValue: { type: "number", example: 10 },
      minOrderAmount: { type: "number", example: 30 },
      maxDiscount: { type: "number", example: 50 },
      usageLimit: { type: "integer", example: 1000 },
      startDate: { type: "string", format: "date-time", example: "2026-01-01T00:00:00Z" },
      endDate: { type: "string", format: "date-time", example: "2026-12-31T23:59:59Z" },
      isActive: { type: "boolean", default: true },
    },
    required: ["code", "discountType", "discountValue", "startDate", "endDate"],
  },
  UpdateCouponInput: {
    type: "object",
    properties: {
      code: { type: "string" },
      discountType: {
        type: "string",
        enum: ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"],
      },
      discountValue: { type: "number" },
      minOrderAmount: { type: "number" },
      maxDiscount: { type: "number" },
      usageLimit: { type: "integer" },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
      isActive: { type: "boolean" },
    },
  },
  ValidateCouponInput: {
    type: "object",
    properties: {
      code: { type: "string", example: "SAVE20" },
      orderAmount: { type: "number", example: 150.0 },
    },
    required: ["code", "orderAmount"],
  },

  // Order schemas
  OrderItem: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      orderId: { type: "string", format: "uuid" },
      variantId: { type: "string", format: "uuid" },
      quantity: { type: "integer", example: 2 },
      unitPrice: { type: "number", example: 49.99 },
      totalPrice: { type: "number", example: 99.98 },
      variant: { $ref: "#/components/schemas/ProductVariant" },
    },
    required: ["id", "orderId", "variantId", "quantity", "unitPrice", "totalPrice"],
  },
  Order: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      orderNumber: { type: "string", example: "ORD-20260911-ABCD" },
      userId: { type: "string" },
      couponId: { type: "string", format: "uuid", nullable: true },
      subtotal: { type: "number", example: 99.98 },
      discountAmount: { type: "number", example: 10.0 },
      taxAmount: { type: "number", example: 8.5 },
      shippingAmount: { type: "number", example: 5.0 },
      totalAmount: { type: "number", example: 103.48 },
      status: {
        type: "string",
        enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
        example: "PENDING",
      },
      paymentStatus: {
        type: "string",
        enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
        example: "PENDING",
      },
      shippingAddressId: { type: "string", format: "uuid", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/OrderItem" },
      },
      shippingAddress: { $ref: "#/components/schemas/UserAddress", nullable: true },
      payments: {
        type: "array",
        items: { $ref: "#/components/schemas/Payment" },
      },
      shipments: {
        type: "array",
        items: { $ref: "#/components/schemas/Shipment" },
      },
    },
    required: [
      "id",
      "orderNumber",
      "userId",
      "subtotal",
      "discountAmount",
      "taxAmount",
      "shippingAmount",
      "totalAmount",
      "status",
      "paymentStatus",
      "createdAt",
      "updatedAt",
    ],
  },
  CreateOrderInput: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "Optional explicit items array; if omitted, orders are created from the user's active cart",
        items: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1 },
            price: { type: "number" },
          },
          required: ["variantId", "quantity"],
        },
      },
      couponId: { type: "string", format: "uuid", description: "Optional coupon UUID to apply discount" },
      shippingAddressId: { type: "string", format: "uuid", description: "Shipping address UUID" },
      taxAmount: { type: "number", example: 12.5 },
      shippingAmount: { type: "number", example: 9.99 },
      discountAmount: { type: "number", example: 15.0 },
      status: {
        type: "string",
        enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
        default: "PENDING",
      },
    },
  },
  UpdateOrderInput: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
      },
      shippingAddressId: { type: "string", format: "uuid" },
    },
  },
  OrderStats: {
    type: "object",
    properties: {
      totalOrders: { type: "integer", example: 142 },
      totalRevenue: { type: "number", example: 28450.75 },
      statusBreakdown: {
        type: "object",
        additionalProperties: { type: "integer" },
        example: { PENDING: 5, PROCESSING: 12, SHIPPED: 25, DELIVERED: 98, CANCELLED: 2 },
      },
    },
  },

  // Payment schemas
  Payment: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      orderId: { type: "string", format: "uuid" },
      paymentMethod: { type: "string", example: "STRIPE" },
      transactionId: { type: "string", example: "txn_1Np7kQ2eZvKYlo2C01234567" },
      amount: { type: "number", example: 103.48 },
      status: {
        type: "string",
        enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
        example: "COMPLETED",
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "orderId", "paymentMethod", "transactionId", "amount", "status", "createdAt", "updatedAt"],
  },
  CreatePaymentInput: {
    type: "object",
    properties: {
      orderId: { type: "string", format: "uuid" },
      paymentMethod: { type: "string", example: "CREDIT_CARD" },
      transactionId: { type: "string", example: "txn_sample_987654" },
      amount: { type: "number", example: 89.99 },
      status: {
        type: "string",
        enum: ["COMPLETED", "FAILED", "REFUNDED"],
        example: "COMPLETED",
      },
    },
    required: ["orderId", "paymentMethod", "transactionId", "amount", "status"],
  },
  UpdatePaymentInput: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["COMPLETED", "FAILED", "REFUNDED"],
        example: "REFUNDED",
      },
    },
    required: ["status"],
  },

  // Shipment schemas
  Shipment: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      orderId: { type: "string", format: "uuid" },
      carrier: { type: "string", example: "FedEx" },
      trackingNumber: { type: "string", example: "FDX-98237461928" },
      status: {
        type: "string",
        enum: ["LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"],
        example: "IN_TRANSIT",
      },
      estimatedDelivery: { type: "string", format: "date-time", nullable: true },
      shippedAt: { type: "string", format: "date-time", nullable: true },
      deliveredAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "orderId", "carrier", "trackingNumber", "status", "createdAt", "updatedAt"],
  },
  CreateShipmentInput: {
    type: "object",
    properties: {
      orderId: { type: "string", format: "uuid" },
      carrier: { type: "string", example: "DHL Express" },
      trackingNumber: { type: "string", example: "DHL-847291837" },
      status: {
        type: "string",
        enum: ["LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"],
        default: "LABEL_CREATED",
      },
      estimatedDelivery: { type: "string", format: "date-time" },
      shippedAt: { type: "string", format: "date-time" },
      deliveredAt: { type: "string", format: "date-time" },
    },
    required: ["orderId", "carrier", "trackingNumber"],
  },
  UpdateShipmentInput: {
    type: "object",
    properties: {
      carrier: { type: "string" },
      trackingNumber: { type: "string" },
      status: {
        type: "string",
        enum: ["LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"],
      },
      estimatedDelivery: { type: "string", format: "date-time" },
      shippedAt: { type: "string", format: "date-time" },
      deliveredAt: { type: "string", format: "date-time" },
    },
  },

  // Vendor Profile schemas
  VendorProfile: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      userId: { type: "string" },
      companyName: { type: "string", example: "Apex Innovations LLC" },
      slug: { type: "string", example: "apex-innovations" },
      description: { type: "string", nullable: true, example: "Leading vendor in smart gadgets" },
      logoUrl: { type: "string", nullable: true, format: "uri" },
      isActive: { type: "boolean", default: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      user: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
        },
      },
      products: {
        type: "array",
        items: { $ref: "#/components/schemas/Product" },
      },
    },
    required: ["id", "userId", "companyName", "slug", "isActive", "createdAt", "updatedAt"],
  },
  CreateVendorProfileInput: {
    type: "object",
    properties: {
      companyName: { type: "string", example: "Zenith Retail" },
      description: { type: "string", example: "Handmade eco-friendly apparel" },
      isActive: { type: "boolean", default: true },
      userId: { type: "string", description: "Admin can assign vendor profile to specific user ID" },
      logo: { type: "string", format: "binary" },
    },
    required: ["companyName"],
  },
  UpdateVendorProfileInput: {
    type: "object",
    properties: {
      companyName: { type: "string" },
      description: { type: "string" },
      isActive: { type: "boolean" },
      logo: { type: "string", format: "binary" },
    },
  },

  // User Address schemas
  UserAddress: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      userId: { type: "string" },
      addressType: { type: "string", enum: ["SHIPPING", "BILLING"], example: "SHIPPING" },
      addressLine1: { type: "string", example: "123 Market St" },
      addressLine2: { type: "string", nullable: true, example: "Suite 400" },
      city: { type: "string", example: "San Francisco" },
      state: { type: "string", example: "CA" },
      postalCode: { type: "string", example: "94105" },
      country: { type: "string", example: "United States" },
      isDefault: { type: "boolean", default: false },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "userId", "addressType", "addressLine1", "city", "state", "postalCode", "country", "isDefault", "createdAt", "updatedAt"],
  },
  CreateUserAddressInput: {
    type: "object",
    properties: {
      addressType: { type: "string", enum: ["SHIPPING", "BILLING"], example: "SHIPPING" },
      addressLine1: { type: "string", example: "123 Market St" },
      addressLine2: { type: "string", example: "Suite 400" },
      city: { type: "string", example: "San Francisco" },
      state: { type: "string", example: "CA" },
      postalCode: { type: "string", example: "94105" },
      country: { type: "string", example: "United States" },
      isDefault: { type: "boolean", default: false },
    },
    required: ["addressType", "addressLine1", "city", "state", "postalCode", "country"],
  },
  UpdateUserAddressInput: {
    type: "object",
    properties: {
      addressType: { type: "string", enum: ["SHIPPING", "BILLING"] },
      addressLine1: { type: "string" },
      addressLine2: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      postalCode: { type: "string" },
      country: { type: "string" },
      isDefault: { type: "boolean" },
    },
  },
};
