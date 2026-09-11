export const couponPaths = {
  "/api/coupons/validate": {
    post: {
      tags: ["Coupons"],
      summary: "Validate coupon",
      description: "Check if a coupon is valid for the authenticated user and given order amount",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ValidateCouponInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Coupon is valid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Coupon is valid" },
                  data: {
                    type: "object",
                    properties: {
                      coupon: { $ref: "#/components/schemas/Coupon" },
                      discountAmount: { type: "number", example: 30.0 },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Coupon expired, inactive, usage limit reached, or min amount not met" },
        401: { description: "Unauthorized" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/coupons": {
    get: {
      tags: ["Coupons"],
      summary: "Get all coupons",
      description: "List all promotional coupons (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "includeInactive",
          in: "query",
          schema: { type: "boolean" },
          description: "Include expired or deactivated coupons",
        },
      ],
      responses: {
        200: {
          description: "List of coupons",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Coupon" },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        500: { description: "Server error" },
      },
    },
    post: {
      tags: ["Coupons"],
      summary: "Create coupon",
      description: "Create a discount code (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateCouponInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Coupon created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Coupon created successfully" },
                  data: { $ref: "#/components/schemas/Coupon" },
                },
              },
            },
          },
        },
        400: { description: "Invalid coupon parameters" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        409: { description: "Coupon code already exists" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/coupons/{code}": {
    get: {
      tags: ["Coupons"],
      summary: "Get coupon by code",
      description: "Retrieve public details of a coupon code",
      parameters: [
        {
          name: "code",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "WELCOME10",
        },
      ],
      responses: {
        200: {
          description: "Coupon details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Coupon" },
                },
              },
            },
          },
        },
        404: { description: "Coupon not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/coupons/id/{id}": {
    get: {
      tags: ["Coupons"],
      summary: "Get coupon by ID",
      description: "Retrieve coupon details by UUID (Admin only)",
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
          description: "Coupon details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Coupon" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Coupon not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/coupons/{id}": {
    patch: {
      tags: ["Coupons"],
      summary: "Update coupon",
      description: "Update coupon settings (Admin only)",
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
            schema: { $ref: "#/components/schemas/UpdateCouponInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Coupon updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Coupon updated successfully" },
                  data: { $ref: "#/components/schemas/Coupon" },
                },
              },
            },
          },
        },
        400: { description: "Invalid coupon parameters" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Coupon not found" },
        409: { description: "Coupon code already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Coupons"],
      summary: "Delete coupon",
      description: "Delete coupon by UUID (Admin only). Fails if coupon has existing usage history.",
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
          description: "Coupon deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Cannot delete coupon with usage history" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Coupon not found" },
        500: { description: "Server error" },
      },
    },
  },
};
