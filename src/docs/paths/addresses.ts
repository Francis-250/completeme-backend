export const addressPaths = {
  "/api/addresses": {
    get: {
      tags: ["Addresses"],
      summary: "Get my addresses",
      description: "Retrieve all saved shipping and billing addresses for the authenticated user",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "List of user addresses",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UserAddress" },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Failed to fetch addresses" },
      },
    },
    post: {
      tags: ["Addresses"],
      summary: "Create address",
      description: "Save a new shipping or billing address for the authenticated user",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateUserAddressInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Address created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Address created successfully" },
                  data: { $ref: "#/components/schemas/UserAddress" },
                },
              },
            },
          },
        },
        400: { description: "All required address fields must be provided" },
        401: { description: "Unauthorized" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/addresses/{id}": {
    get: {
      tags: ["Addresses"],
      summary: "Get address by ID",
      description: "Retrieve an address by UUID (belonging to current user)",
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
          description: "Address details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/UserAddress" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - You do not own this address" },
        404: { description: "Address not found" },
        500: { description: "Server error" },
      },
    },
    patch: {
      tags: ["Addresses"],
      summary: "Update address",
      description: "Update details of an existing address",
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
            schema: { $ref: "#/components/schemas/UpdateUserAddressInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Address updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Address updated successfully" },
                  data: { $ref: "#/components/schemas/UserAddress" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Address not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Addresses"],
      summary: "Delete address",
      description: "Delete an address. Fails if address is referenced in previous orders.",
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
          description: "Address deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Cannot delete address used in orders" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Address not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/addresses/{id}/default": {
    patch: {
      tags: ["Addresses"],
      summary: "Set default address",
      description: "Mark this address as the default address for the current user",
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
          description: "Default address updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Default address updated successfully" },
                  data: { $ref: "#/components/schemas/UserAddress" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Address not found" },
        500: { description: "Server error" },
      },
    },
  },
};
