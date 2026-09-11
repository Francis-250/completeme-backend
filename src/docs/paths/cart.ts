export const cartPaths = {
  "/api/cart": {
    get: {
      tags: ["Cart"],
      summary: "Get cart",
      description: "Retrieve all items currently in the authenticated user's cart",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "List of cart items",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CartItem" },
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
      tags: ["Cart"],
      summary: "Add item to cart",
      description: "Add a product variant with specified quantity to the user's cart",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToCartInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Item added to cart",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Item added to cart successfully" },
                  data: { $ref: "#/components/schemas/CartItem" },
                },
              },
            },
          },
        },
        400: { description: "Insufficient stock or inactive product" },
        401: { description: "Unauthorized" },
        404: { description: "Variant not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Cart"],
      summary: "Clear cart",
      description: "Remove all items from the authenticated user's cart",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "Cart cleared successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/cart/summary": {
    get: {
      tags: ["Cart"],
      summary: "Get cart summary",
      description: "Retrieve cart total quantity, distinct items, and subtotal calculation",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "Cart summary calculation",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/CartSummary" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/cart/{variantId}": {
    patch: {
      tags: ["Cart"],
      summary: "Update cart item quantity",
      description: "Update the quantity for a specific variant in the user's cart",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "variantId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCartInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Cart item updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Cart updated successfully" },
                  data: { $ref: "#/components/schemas/CartItem" },
                },
              },
            },
          },
        },
        400: { description: "Valid quantity required or insufficient stock" },
        401: { description: "Unauthorized" },
        404: { description: "Cart item or variant not found" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Cart"],
      summary: "Remove item from cart",
      description: "Remove a specific variant from the user's cart",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "variantId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Item removed from cart",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Cart item not found" },
        500: { description: "Server error" },
      },
    },
  },
};
