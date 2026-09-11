export const vendorPaths = {
  "/api/vendors": {
    get: {
      tags: ["Vendors"],
      summary: "Get vendor profiles",
      description: "List all vendor profiles, optionally including inactive ones",
      parameters: [
        {
          name: "includeInactive",
          in: "query",
          schema: { type: "boolean" },
        },
      ],
      responses: {
        200: {
          description: "List of vendor profiles",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/VendorProfile" },
                  },
                },
              },
            },
          },
        },
        500: { description: "Failed to fetch vendor profiles" },
      },
    },
    post: {
      tags: ["Vendors"],
      summary: "Create vendor profile",
      description: "Create a merchant vendor profile with logo and details (Admin or Vendor role)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/CreateVendorProfileInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Vendor profile created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Vendor profile created successfully" },
                  data: { $ref: "#/components/schemas/VendorProfile" },
                },
              },
            },
          },
        },
        400: { description: "Company name is required" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        409: { description: "Vendor profile already exists for this user or name taken" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/vendors/me": {
    get: {
      tags: ["Vendors"],
      summary: "Get my vendor profile",
      description: "Retrieve vendor store profile for the currently logged-in user",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        200: {
          description: "Current user's vendor profile",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/VendorProfile" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Vendor profile not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/vendors/{slug}": {
    get: {
      tags: ["Vendors"],
      summary: "Get vendor by slug",
      description: "Retrieve public vendor store profile by unique slug",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "apex-innovations",
        },
      ],
      responses: {
        200: {
          description: "Vendor profile",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/VendorProfile" },
                },
              },
            },
          },
        },
        404: { description: "Vendor profile not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/vendors/id/{id}": {
    get: {
      tags: ["Vendors"],
      summary: "Get vendor by ID",
      description: "Retrieve vendor profile by UUID",
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
          description: "Vendor profile",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/VendorProfile" },
                },
              },
            },
          },
        },
        404: { description: "Vendor profile not found" },
        500: { description: "Server error" },
      },
    },
  },
  "/api/vendors/{id}": {
    patch: {
      tags: ["Vendors"],
      summary: "Update vendor profile",
      description: "Update company name, description, active status, or logo (Vendor owner or Admin)",
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
            schema: { $ref: "#/components/schemas/UpdateVendorProfileInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Vendor profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Vendor profile updated successfully" },
                  data: { $ref: "#/components/schemas/VendorProfile" },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Vendor profile not found" },
        409: { description: "Vendor name already exists" },
        500: { description: "Server error" },
      },
    },
    delete: {
      tags: ["Vendors"],
      summary: "Delete vendor profile",
      description: "Delete vendor profile (Admin only). Fails if vendor has associated products.",
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
          description: "Vendor profile deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        400: { description: "Cannot delete vendor with active products" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden - Admin role required" },
        404: { description: "Vendor profile not found" },
        500: { description: "Server error" },
      },
    },
  },
};
