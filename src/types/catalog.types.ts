export interface CreateBrandData {
  name: string;
  description?: string;
  logo?: Express.Multer.File;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
  logo?: Express.Multer.File;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  image?: Express.Multer.File;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: string;
  image?: Express.Multer.File;
}

export interface CreateTagData {
  name: string;
}

export interface UpdateTagData {
  name?: string;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  image?: Express.Multer.File;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  image?: Express.Multer.File;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateProductData {
  name: string;
  description?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  images?: Express.Multer.File[];
  variants: CreateProductVariantData[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  images?: Express.Multer.File[];
  variants?: CreateProductVariantData[];
}

export interface CreateProductVariantData {
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  weight?: number;
  attributes: Record<string, unknown>;
  images?: Express.Multer.File[];
}

export interface UpdateProductVariantData {
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  weight?: number;
  attributes?: Record<string, unknown>;
  images?: Express.Multer.File[];
}

export interface CreateProductReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateProductReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  isApproved?: boolean;
}

export interface CreateWishlistData {
  productId: string;
}

export interface CreateCartItemData {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface CreateCouponData {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

export interface UpdateCouponData {
  code?: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface CreateOrderData {
  userId?: string;
  couponId?: string;
  totalAmount: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  shippingAddressId?: string;
  items: CreateOrderItemData[];
}

export interface UpdateOrderData {
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  shippingAddressId?: string;
}

export interface CreateOrderItemData {
  variantId?: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface CreatePaymentData {
  orderId: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  status: "COMPLETED" | "FAILED" | "REFUNDED";
}

export interface UpdatePaymentData {
  status?: "COMPLETED" | "FAILED" | "REFUNDED";
}

export interface CreateShipmentData {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status?: "LABEL_CREATED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "EXCEPTION";
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface UpdateShipmentData {
  carrier?: string;
  trackingNumber?: string;
  status?: "LABEL_CREATED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "EXCEPTION";
  estimatedDelivery?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface CreateVendorProfileData {
  userId: string;
  companyName: string;
  description?: string;
  logo?: Express.Multer.File;
  isActive?: boolean;
}

export interface UpdateVendorProfileData {
  companyName?: string;
  description?: string;
  logo?: Express.Multer.File;
  isActive?: boolean;
}

export interface CreateUserAddressData {
  userId?: string;
  addressType: "SHIPPING" | "BILLING";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateUserAddressData {
  addressType?: "SHIPPING" | "BILLING";
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}