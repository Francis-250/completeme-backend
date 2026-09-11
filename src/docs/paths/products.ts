export const productPaths = {
  "/api/products": {
    get: {
      tags: ["Products"],
      summary: "Get products",
      description: "Retrieve a paginated list of products with various filters",
      parameters: [
        {
          name: "categoryId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter products by category UUID",
        },
        {
          name: "brandId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter products by brand UUID",
        },
        {
          name: "vendorId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter products by vendor profile UUID",
        },
        {
          name: "isActive",
          in: "query",
          schema: { type: "boolean" },
          description: "Filter active or inactive products",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Search keyword matching title/description",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Page number",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20 },
          description: "Items per page",
        },
      ],
      responses: {
        200: {
          description: "Paginated product list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          total: { type: "integer", example: 100 },
                          page: { type: "integer", example: 1 },
                          limit: { type: "integer", example: 20 },
                          totalPages: { type: "integer", example: 5 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        500: { description: "Failed to fetch products" },
      },
    },
    post: {
      tags: ["Products"],
      summary: "Create product",
      description: "Create a new product with variants and optional images (Admin or Vendor role)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateProductInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Product created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product created successfully" },
                  data: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
        400: { description: "Missing name or variants array" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin or Vendor role required" },
        404: { description: "Category, Brand, or Vendor not found" },
        409: { description: "Product already exists" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/products/{slug}": {
    get: {
      tags: ["Products"],
      summary: "Get product by slug",
      description: "Retrieve complete product details, variants, images, and reviews by unique slug",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "iphone-16-pro",
        },
      ],
      responses: {
        200: {
          description: "Product details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
        404: { description: "Product not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/products/id/{id}": {
    get: {
      tags: ["Products"],
      summary: "Get product by ID",
      description: "Retrieve product details by UUID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Product details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
        404: { description: "Product not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/products/{id}": {
    patch: {
      tags: ["Products"],
      summary: "Update product",
      description: "Update product details or add images (Admin or product's Vendor)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/UpdateProductInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Product updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product updated successfully" },
                  data: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
        },
        400: { description: "Bad request" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Product, Category, or Brand not found" },
        409: { description: "Product name already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Products"],
      summary: "Delete product",
      description: "Delete product and associated variants/images (Admin or product's Vendor)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Product deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Product not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/products/{id}/variants": {
    post: {
      tags: ["Products"],
      summary: "Create product variant",
      description: "Add a new variant (SKU, price, attributes, stock) to an existing product",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateVariantInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Variant created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Variant created successfully" },
                  data: { $ref: "#/components/schemas/ProductVariant" },
                },
              },
            },
          },
        },
        400: { description: "SKU, price, and stockQuantity are required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Product not found" },
        409: { description: "Variant SKU already exists" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/products/variants/{variantId}": {
    patch: {
      tags: ["Products"],
      summary: "Update product variant",
      description: "Update variant pricing, stock, attributes, or images",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "variantId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/UpdateVariantInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Variant updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Variant updated successfully" },
                  data: { $ref: "#/components/schemas/ProductVariant" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Variant not found" },
        409: { description: "SKU already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Products"],
      summary: "Delete product variant",
      description: "Delete variant by UUID",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "variantId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Variant deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Variant not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/products/{id}/tags": {
    post: {
      tags: ["Products"],
      summary: "Add tag to product",
      description: "Attach an existing tag to a product",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddTagToProductInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Tag added to product successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Tag ID is required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Product or Tag not found" },
        409: { description: "Tag already added to product" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Products"],
      summary: "Remove tag from product",
      description: "Detach a tag from a product",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddTagToProductInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Tag removed from product successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Tag ID is required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Product not found or tag not attached" },
        500: { description: "Server error" },
      },
    },
  },
};
