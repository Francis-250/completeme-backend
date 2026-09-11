export const reviewPaths = {
  "/api/reviews": {
    get: {
      tags: ["Reviews"],
      summary: "Get reviews",
      description: "List product reviews. Regular users see only approved reviews; admins can filter by approval status.",
      parameters: [
        {
          name: "productId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter reviews for a specific product",
        },
        {
          name: "userId",
          in: "query",
          schema: { type: "string" },
          description: "Filter reviews written by a specific user",
        },
        {
          name: "isApproved",
          in: "query",
          schema: { type: "boolean" },
          description: "Admin only: filter by approval state",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20 },
        },
      ],
      responses: {
        200: {
          description: "Paginated list of reviews",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      reviews: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ProductReview" },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          totalPages: { type: "integer" },
                        },
                      },
                    },
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
      tags: ["Reviews"],
      summary: "Create review",
      description: "Submit a product review with rating (1-5), optional title, and comments (Authenticated customer)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateReviewInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Review created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Review created successfully" },
                  data: { $ref: "#/components/schemas/ProductReview" },
                },
              },
            },
          },
        },
        400: { description: "Product ID or valid rating (1-5) required" },
        401: { description: "Unauthorized" },
        404: { description: "Product not found" },
        409: { description: "You have already reviewed this product" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/reviews/{id}": {
    get: {
      tags: ["Reviews"],
      summary: "Get review by ID",
      description: "Retrieve a specific review by UUID",
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
          description: "Review details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/ProductReview" },
                },
              },
            },
          },
        },
        404: { description: "Review not found" },
        500: { description: "Server error" },
      },
    },
    patch: {
      tags: ["Reviews"],
      summary: "Update review",
      description: "Update review content (Author) or approval state (Admin)",
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
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateReviewInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Review updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Review updated successfully" },
                  data: { $ref: "#/components/schemas/ProductReview" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - You can only edit your own reviews" },
        404: { description: "Review not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Reviews"],
      summary: "Delete review",
      description: "Delete review by UUID (Author or Admin)",
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
          description: "Review deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Review not found" },
        500: { description: "Server error" },
      },
    },
  },
};
