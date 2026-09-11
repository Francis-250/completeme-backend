export const collectionPaths = {
  "/api/collections": {
    get: {
      tags: ["Collections"],
      summary: "Get all collections",
      description: "Retrieve all collections, optionally including inactive ones",
      parameters: [
        {
          name: "includeInactive",
          in: "query",
          schema: { type: "boolean" },
          description: "When true, includes inactive collections",
        },
      ],
      responses: {
        200: {
          description: "List of collections",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Collection" },
                  },
                },
              },
            },
          },
        },
        500: { description: "Server error" },
      },
    },
    post: {
      tags: ["Collections"],
      summary: "Create collection",
      description: "Create a promotional or seasonal collection (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateCollectionInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Collection created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Collection created successfully" },
                  data: { $ref: "#/components/schemas/Collection" },
                },
              },
            },
          },
        },
        400: { description: "Collection name is required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        409: { description: "Collection already exists" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/collections/{slug}": {
    get: {
      tags: ["Collections"],
      summary: "Get collection by slug",
      description: "Retrieve collection with its products by unique slug",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "black-friday-2026",
        },
      ],
      responses: {
        200: {
          description: "Collection details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Collection" },
                },
              },
            },
          },
        },
        404: { description: "Collection not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/collections/id/{id}": {
    get: {
      tags: ["Collections"],
      summary: "Get collection by ID",
      description: "Retrieve collection by UUID",
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
          description: "Collection details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Collection" },
                },
              },
            },
          },
        },
        404: { description: "Collection not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/collections/{id}": {
    patch: {
      tags: ["Collections"],
      summary: "Update collection",
      description: "Update collection attributes or image (Admin only)",
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
            schema: { $ref: "#/components/schemas/UpdateCollectionInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Collection updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Collection updated successfully" },
                  data: { $ref: "#/components/schemas/Collection" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Collection not found" },
        409: { description: "Collection name already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Collections"],
      summary: "Delete collection",
      description: "Delete collection by UUID (Admin only)",
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
          description: "Collection deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Collection not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/collections/{id}/products": {
    post: {
      tags: ["Collections"],
      summary: "Add product to collection",
      description: "Associate a product with a collection with sort order (Admin only)",
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
            schema: { $ref: "#/components/schemas/AddProductToCollectionInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Product added to collection",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product added to collection successfully" },
                },
              },
            },
          },
        },
        400: { description: "Product ID required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Collection or Product not found" },
        409: { description: "Product already in collection" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Collections"],
      summary: "Remove product from collection",
      description: "Remove product link from a collection (Admin only)",
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
            schema: { $ref: "#/components/schemas/RemoveProductFromCollectionInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Product removed from collection",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Product ID is required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Product not in collection" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/collections/{id}/products/sort": {
    patch: {
      tags: ["Collections"],
      summary: "Update product sort order in collection",
      description: "Change the sorting sequence of a product in collection (Admin only)",
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
            schema: { $ref: "#/components/schemas/SortCollectionProductInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Product sort order updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product sort order updated successfully" },
                },
              },
            },
          },
        },
        400: { description: "Product ID and sortOrder are required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Product not in collection" },
        500: { description: "Server error" },
      },
    },
  },
};
