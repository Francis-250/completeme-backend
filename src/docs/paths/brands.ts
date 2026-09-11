export const brandPaths = {
  "/api/brands": {
    get: {
      tags: ["Brands"],
      summary: "Get all brands",
      description: "Retrieve all brands in the catalog",
      responses: {
        200: {
          description: "List of brands",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Brand" },
                  },
                },
              },
            },
          },
        },
        500: { description: "Failed to fetch brands" },
      },
    },
    post: {
      tags: ["Brands"],
      summary: "Create brand",
      description: "Create a new brand with optional logo image (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateBrandInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Brand created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Brand created successfully" },
                  data: { $ref: "#/components/schemas/Brand" },
                },
              },
            },
          },
        },
        400: { description: "Brand name is required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        409: { description: "Brand already exists" },
        500: { description: "Failed to create brand" },
      },
    },
  },
  "/api/brands/{slug}": {
    get: {
      tags: ["Brands"],
      summary: "Get brand by slug",
      description: "Retrieve brand details by unique slug",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "apple",
        },
      ],
      responses: {
        200: {
          description: "Brand details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Brand" },
                },
              },
            },
          },
        },
        404: { description: "Brand not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/brands/{id}": {
    patch: {
      tags: ["Brands"],
      summary: "Update brand",
      description: "Update brand information or logo image (Admin only)",
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
            schema: { $ref: "#/components/schemas/UpdateBrandInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Brand updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Brand updated successfully" },
                  data: { $ref: "#/components/schemas/Brand" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Brand not found" },
        409: { description: "Brand name already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Brands"],
      summary: "Delete brand",
      description: "Delete brand by UUID (Admin only)",
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
          description: "Brand deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Brand not found" },
        500: { description: "Server error" },
      },
    },
  },
};
