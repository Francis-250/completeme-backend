export const tagPaths = {
  "/api/tags": {
    get: {
      tags: ["Tags"],
      summary: "Get all tags",
      description: "Retrieve all product tags in the catalog",
      responses: {
        200: {
          description: "List of all tags",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Tag" },
                  },
                },
              },
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    post: {
      tags: ["Tags"],
      summary: "Create a new tag",
      description: "Create a new product tag (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateTagInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Tag created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Tag created successfully" },
                  data: { $ref: "#/components/schemas/Tag" },
                },
              },
            },
          },
        },
        400: {
          description: "Tag name is required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        409: {
          description: "Tag already exists",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: { description: "Failed to create tag" },
      },
    },
  },
  "/api/tags/{slug}": {
    get: {
      tags: ["Tags"],
      summary: "Get tag by slug",
      description: "Retrieve a single tag by unique slug with its associated products",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Tag slug",
          example: "summer-2026",
        },
      ],
      responses: {
        200: {
          description: "Tag found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Tag" },
                },
              },
            },
          },
        },
        404: {
          description: "Tag not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: { description: "Server error" },
      },
    },
  },
  "/api/tags/id/{id}": {
    get: {
      tags: ["Tags"],
      summary: "Get tag by ID",
      description: "Retrieve a single tag by UUID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Tag UUID",
        },
      ],
      responses: {
        200: {
          description: "Tag found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Tag" },
                },
              },
            },
          },
        },
        404: {
          description: "Tag not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        500: { description: "Server error" },
      },
    },
  },
  "/api/tags/{id}": {
    patch: {
      tags: ["Tags"],
      summary: "Update tag",
      description: "Update tag details by UUID (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Tag UUID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateTagInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Tag updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Tag updated successfully" },
                  data: { $ref: "#/components/schemas/Tag" },
                },
              },
            },
          },
        },
        400: { description: "Cannot delete tag with products or invalid data" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Tag not found" },
        409: { description: "Tag name already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Tags"],
      summary: "Delete tag",
      description: "Delete tag by UUID (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Tag UUID",
        },
      ],
      responses: {
        200: {
          description: "Tag deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Cannot delete tag with associated products" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Tag not found" },
        500: { description: "Server error" },
      },
    },
  },
};
