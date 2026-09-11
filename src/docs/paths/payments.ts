export const paymentPaths = {
  "/api/payments": {
    get: {
      tags: ["Payments"],
      summary: "Get payments",
      description: "List payment records with pagination and filters. Non-admins see only payments for their orders.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "orderId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filter by order UUID",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
          },
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
          description: "List of payment records",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      payments: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Payment" },
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
        401: { description: "Unauthorized" },
        500: { description: "Server error" },
      },
    },
    post: {
      tags: ["Payments"],
      summary: "Record payment",
      description: "Record a new payment transaction against an order (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreatePaymentInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Payment recorded successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Payment recorded successfully" },
                  data: { $ref: "#/components/schemas/Payment" },
                },
              },
            },
          },
        },
        400: { description: "Missing required fields or invalid status" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Order not found" },
        409: { description: "Transaction ID already exists" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/payments/{id}": {
    get: {
      tags: ["Payments"],
      summary: "Get payment by ID",
      description: "Retrieve payment details by UUID",
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
          description: "Payment details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Payment" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Payment not found" },
        500: { description: "Server error" },
      },
    },
    patch: {
      tags: ["Payments"],
      summary: "Update payment status",
      description: "Update status of an existing payment (Admin only)",
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
            schema: { $ref: "#/components/schemas/UpdatePaymentInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Payment updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Payment updated successfully" },
                  data: { $ref: "#/components/schemas/Payment" },
                },
              },
            },
          },
        },
        400: { description: "Valid status required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Payment not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Payments"],
      summary: "Delete payment",
      description: "Delete payment record (Admin only). Cannot delete completed or refunded payments.",
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
          description: "Payment deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Cannot delete completed or refunded payment" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Payment not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/payments/transaction/{transactionId}": {
    get: {
      tags: ["Payments"],
      summary: "Get payment by transaction ID",
      description: "Retrieve payment record using the payment gateway transaction ID",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "transactionId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Payment details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Payment" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Payment not found" },
        500: { description: "Server error" },
      },
    },
  },
};
