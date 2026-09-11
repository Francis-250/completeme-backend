export const wishlistPaths = {
  "/api/wishlist": {
    get: {
      tags: ["Wishlist"],
      summary: "Get wishlist",
      description: "Retrieve all products currently in the authenticated user's wishlist",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "List of wishlist items",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/WishlistItem" },
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
      tags: ["Wishlist"],
      summary: "Add product to wishlist",
      description: "Save a product to the authenticated user's wishlist",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToWishlistInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Product added to wishlist",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Product added to wishlist successfully" },
                  data: { $ref: "#/components/schemas/WishlistItem" },
                },
              },
            },
          },
        },
        400: { description: "Product ID is required" },
        401: { description: "Unauthorized" },
        404: { description: "Product not found" },
        409: { description: "Product already in wishlist" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Wishlist"],
      summary: "Clear wishlist",
      description: "Remove all items from the authenticated user's wishlist",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "Wishlist cleared",
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
  "/api/wishlist/check/{productId}": {
    get: {
      tags: ["Wishlist"],
      summary: "Check product in wishlist",
      description: "Check whether a specific product is saved in the user's wishlist",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Product UUID to check",
        },
      ],
      responses: {
        200: {
          description: "Check result",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      inWishlist: { type: "boolean", example: true },
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
  },
  "/api/wishlist/{productId}": {
    delete: {
      tags: ["Wishlist"],
      summary: "Remove product from wishlist",
      description: "Remove an item from the user's wishlist by product UUID",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Product removed from wishlist",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Product not in wishlist" },
        500: { description: "Server error" },
      },
    },
  },
};
