export const shipmentPaths = {
  "/api/shipments": {
    get: {
      tags: ["Shipments"],
      summary: "Get shipments",
      description: "List shipment records. Non-admin users see only shipments for their orders.",
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
            enum: ["LABEL_CREATED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"],
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
          description: "List of shipments",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      shipments: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Shipment" },
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
      tags: ["Shipments"],
      summary: "Create shipment",
      description: "Create a shipment with carrier and tracking number (Admin only)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateShipmentInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Shipment created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Shipment created successfully" },
                  data: { $ref: "#/components/schemas/Shipment" },
                },
              },
            },
          },
        },
        400: { description: "Missing required shipment fields or invalid status" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Order not found" },
        409: { description: "Tracking number already exists" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/shipments/{id}": {
    get: {
      tags: ["Shipments"],
      summary: "Get shipment by ID",
      description: "Retrieve shipment details by UUID",
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
          description: "Shipment details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Shipment" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Shipment not found" },
        500: { description: "Server error" },
      },
    },
    patch: {
      tags: ["Shipments"],
      summary: "Update shipment",
      description: "Update shipment tracking status or delivery dates (Admin only)",
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
            schema: { $ref: "#/components/schemas/UpdateShipmentInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Shipment updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Shipment updated successfully" },
                  data: { $ref: "#/components/schemas/Shipment" },
                },
              },
            },
          },
        },
        400: { description: "Invalid shipment status" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Shipment not found" },
        409: { description: "Tracking number already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Shipments"],
      summary: "Delete shipment",
      description: "Delete shipment record (Admin only)",
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
          description: "Shipment deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Shipment not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/shipments/tracking/{trackingNumber}": {
    get: {
      tags: ["Shipments"],
      summary: "Get shipment by tracking number",
      description: "Retrieve shipment by carrier tracking number",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "trackingNumber",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "FDX-98237461928",
        },
      ],
      responses: {
        200: {
          description: "Shipment details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Shipment" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Shipment not found" },
        500: { description: "Server error" },
      },
    },
  },
};
