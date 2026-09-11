export const orderPaths = {
  "/api/orders": {
    get: {
      tags: ["Orders"],
      summary: "Get orders",
      description: "Retrieve a paginated list of orders. Customers see their own orders; admins see all orders.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"],
          },
          description: "Filter orders by status",
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
          description: "List of orders",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      orders: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Order" },
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
        500: { description: "Failed to fetch orders" },
      },
    },
    post: {
      tags: ["Orders"],
      summary: "Create order",
      description: "Create an order from active cart or custom items array, validating stock and coupon",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateOrderInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Order created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order created successfully" },
                  data: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
        400: { description: "Cart is empty, insufficient stock, or invalid shipping address" },
        401: { description: "Unauthorized" },
        500: { description: "Failed to create order" },
      },
    },
  },
  "/api/orders/stats": {
    get: {
      tags: ["Orders"],
      summary: "Get order statistics",
      description: "Retrieve aggregated metrics (total orders, total revenue, status breakdown). Regular users receive metrics for their own orders; admins receive store-wide metrics.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "Order statistics",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/OrderStats" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Failed to fetch stats" },
      },
    },
  },
  "/api/orders/{id}": {
    get: {
      tags: ["Orders"],
      summary: "Get order by ID",
      description: "Retrieve order details, ordered items, payments, and tracking shipments",
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
          description: "Order details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - You cannot view another user's order" },
        404: { description: "Order not found" },
        500: { description: "Server error" },
      },
    },
    patch: {
      tags: ["Orders"],
      summary: "Update order",
      description: "Update order status or change shipping address",
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
            schema: { $ref: "#/components/schemas/UpdateOrderInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Order updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order updated successfully" },
                  data: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
        400: { description: "Invalid status transition or invalid shipping address" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Order not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/orders/{id}/cancel": {
    post: {
      tags: ["Orders"],
      summary: "Cancel order",
      description: "Cancel an order and return reserved stock to inventory",
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
          description: "Order cancelled successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Order cancelled successfully" },
                  data: { $ref: "#/components/schemas/Order" },
                },
              },
            },
          },
        },
        400: { description: "Cannot cancel order in current status" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Order not found" },
        500: { description: "Server error" },
      },
    },
  },
};
