export const categoryPaths = {
  "/api/categories": {
    get: {
      tags: ["Categories"],
      summary: "Get all categories",
      description: "Retrieve all categories, optionally including nested subcategories",
      parameters: [
        {
          name: "includeChildren",
          in: "query",
          schema: { type: "boolean" },
          description: "When true, includes nested child categories",
          example: true,
        },
      ],
      responses: {
        200: {
          description: "List of categories",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Category" },
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
      tags: ["Categories"],
      summary: "Create category",
      description: "Create a new category (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateCategoryInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Category created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Category created successfully" },
                  data: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
        400: { description: "Category name is required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Parent category not found" },
        409: { description: "Category already exists" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/categories/{slug}": {
    get: {
      tags: ["Categories"],
      summary: "Get category by slug",
      description: "Retrieve a category by unique slug",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "smartphones",
        },
      ],
      responses: {
        200: {
          description: "Category details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
        404: { description: "Category not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/categories/id/{id}": {
    get: {
      tags: ["Categories"],
      summary: "Get category by ID",
      description: "Retrieve category details by UUID",
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
          description: "Category details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
        404: { description: "Category not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/categories/{id}": {
    patch: {
      tags: ["Categories"],
      summary: "Update category",
      description: "Update category details by UUID (Admin only)",
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
            schema: { $ref: "#/components/schemas/UpdateCategoryInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Category updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Category updated successfully" },
                  data: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
        400: { description: "Invalid update or self-parenting loop" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Category or parent category not found" },
        409: { description: "Category name already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Categories"],
      summary: "Delete category",
      description: "Delete category by UUID (Admin only). Fails if category has children or products.",
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
          description: "Category deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Cannot delete category with children or products" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Category not found" },
        500: { description: "Server error" },
      },
    },
  },
};
