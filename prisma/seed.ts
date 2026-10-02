import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { Redis } from "ioredis";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const isNeon =
  connectionString.includes("neon.tech") || connectionString.includes("neon");

const adapter = isNeon
  ? new PrismaNeon({ connectionString })
  : new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    })
  : null;

async function clearAppCache() {
  if (!redis) return;

  const patterns = [
    "products:*",
    "product:*",
    "categories:*",
    "category:*",
    "brands:*",
    "brand:*",
    "deals:*",
    "collections:*",
    "collection:*",
    "tags:*",
    "tag:*",
    "settings:*",
  ];

  try {
    if (redis.status === "wait" || redis.status === "end") {
      await redis.connect();
    }
    let totalDeleted = 0;

    for (const pattern of patterns) {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          totalDeleted += await redis.del(...keys);
        }
      } while (cursor !== "0");
    }

    console.log(`🧽 Cleared ${totalDeleted} cached app entries.`);
  } catch (err) {
    console.warn(
      "⚠️ Could not clear Redis cache after seed:",
      err instanceof Error ? err.message : err,
    );
  }
}

async function main() {
  console.log("🌱 Starting database seeding for completeme...");
  await clearAppCache();

  // 1. Clean up database in reverse foreign key order
  console.log("🧹 Cleaning up existing records...");
  await prisma.contactInquiry.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.collectionProduct.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.twoFactor.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleanup complete.");

  // Common password hash for all seed accounts: "Password123!"
  const defaultHashedPassword = await hashPassword("Password123!");

  // 2. Seed Users
  console.log(
    "👤 Seeding Users, Accounts, Sessions, 2FA, and Verifications...",
  );
  const adminUser = await prisma.user.create({
    data: {
      id: "usr-admin-0001",
      name: "Francois Admin",
      email: "admin@completeme.com",
      emailVerified: true,
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      phoneNumber: null,
      phoneNumberVerified: false,
      username: "admin_francois",
      displayUsername: "Francois Admin",
      role: "ADMIN",
      twoFactorEnabled: false,
    },
  });

  const vendorUser1 = await prisma.user.create({
    data: {
      id: "usr-vendor-0001",
      name: "Marcus Aurelius",
      email: "marcus@auratech.com",
      emailVerified: true,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      phoneNumber: null,
      phoneNumberVerified: false,
      username: "marcus_auratech",
      displayUsername: "Marcus Aurelius",
      role: "VENDOR",
    },
  });

  const vendorUser2 = await prisma.user.create({
    data: {
      id: "usr-vendor-0002",
      name: "Elena Rostova",
      email: "elena@velvetvine.com",
      emailVerified: true,
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      phoneNumber: null,
      phoneNumberVerified: false,
      username: "elena_velvet",
      displayUsername: "Elena Rostova",
      role: "VENDOR",
    },
  });

  const customerUser1 = await prisma.user.create({
    data: {
      id: "usr-cust-0001",
      name: "Lucas Vance",
      email: "lucas.vance@example.com",
      emailVerified: true,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      phoneNumber: null,
      phoneNumberVerified: false,
      username: "lucas_vance",
      displayUsername: "Lucas Vance",
      role: "CUSTOMER",
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      id: "usr-cust-0002",
      name: "Sophia Martinez",
      email: "sophia.m@example.com",
      emailVerified: true,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
      phoneNumber: null,
      phoneNumberVerified: false,
      username: "sophia_m",
      displayUsername: "Sophia Martinez",
      role: "CUSTOMER",
    },
  });

  // 3. Seed Accounts (Better Auth credential logins)
  const users = [
    adminUser,
    vendorUser1,
    vendorUser2,
    customerUser1,
    customerUser2,
  ];
  for (const u of users) {
    await prisma.account.create({
      data: {
        id: `acc-${u.id}`,
        accountId: u.id,
        providerId: "credential",
        userId: u.id,
        password: defaultHashedPassword,
      },
    });
  }

  // 4. Seed Active Sessions
  await prisma.session.create({
    data: {
      id: "sess-admin-0001",
      token: "session_token_admin_test_1234567890",
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Seed Script)",
    },
  });

  await prisma.session.create({
    data: {
      id: "sess-cust-0001",
      token: "session_token_customer_test_9876543210",
      userId: customerUser1.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Seed Script)",
    },
  });

  // 5. Seed TwoFactor for Admin
  await prisma.twoFactor.create({
    data: {
      id: "2fa-admin-0001",
      userId: adminUser.id,
      secret: "JBSWY3DPEHPK3PXP",
      backupCodes: JSON.stringify([
        "CODE-1234-5678",
        "CODE-9876-5432",
        "CODE-4321-8765",
      ]),
      verified: true,
      failedVerificationCount: 0,
    },
  });

  // 6. Seed Verification record
  await prisma.verification.create({
    data: {
      id: "verif-welcome-0001",
      identifier: "verify_admin@completeme.com",
      value: "847291",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // 7. Seed Vendor Profiles
  console.log("🏬 Seeding Vendor Profiles...");
  const vendorProfile1 = await prisma.vendorProfile.create({
    data: {
      id: "vp-aura-tech",
      userId: vendorUser1.id,
      companyName: "Aura Tech Global",
      slug: "aura-tech-global",
      description:
        "Premier distributor of cutting-edge smart electronics, audio gear, and personal tech.",
      logoUrl:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
      isActive: true,
    },
  });

  const vendorProfile2 = await prisma.vendorProfile.create({
    data: {
      id: "vp-velvet-vine",
      userId: vendorUser2.id,
      companyName: "Velvet & Vine Boutique",
      slug: "velvet-and-vine",
      description:
        "Artisan apparel, outdoor lifestyle essentials, and sustainable handcrafted accessories.",
      logoUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80",
      isActive: true,
    },
  });

  // 8. Seed User Addresses
  console.log("📍 Seeding User Addresses...");
  const addressCust1Shipping = await prisma.userAddress.create({
    data: {
      id: "addr-cust1-shipping",
      userId: customerUser1.id,
      addressType: "SHIPPING",
      addressLine1: "KG 7 Ave",
      addressLine2: "Kacyiru",
      city: "Kigali",
      state: "Kigali City",
      postalCode: "00000",
      country: "Rwanda",
      isDefault: true,
    },
  });

  const addressCust1Billing = await prisma.userAddress.create({
    data: {
      id: "addr-cust1-billing",
      userId: customerUser1.id,
      addressType: "BILLING",
      addressLine1: "KG 7 Ave",
      addressLine2: "Kacyiru",
      city: "Kigali",
      state: "Kigali City",
      postalCode: "00000",
      country: "Rwanda",
      isDefault: true,
    },
  });

  const addressCust2 = await prisma.userAddress.create({
    data: {
      id: "addr-cust2-shipping",
      userId: customerUser2.id,
      addressType: "SHIPPING",
      addressLine1: "KN 3 Rd",
      addressLine2: "Nyarugenge",
      city: "Kigali",
      state: "Kigali City",
      postalCode: "00000",
      country: "Rwanda",
      isDefault: true,
    },
  });

  // 9. Seed Brands
  console.log("🏷️ Seeding Brands...");
  const brandApple = await prisma.brand.create({
    data: {
      id: "brand-apple",
      name: "Apple",
      slug: "apple",
      description:
        "Pioneering premium consumer electronics, personal computers, and mobile technology.",
      logoUrl:
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80",
    },
  });

  const brandSony = await prisma.brand.create({
    data: {
      id: "brand-sony",
      name: "Sony",
      slug: "sony",
      description:
        "World-class leader in acoustic engineering, imaging sensors, and audiovisual equipment.",
      logoUrl:
        "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=300&q=80",
    },
  });

  const brandNike = await prisma.brand.create({
    data: {
      id: "brand-nike",
      name: "Nike",
      slug: "nike",
      description:
        "Iconic athletic footwear, innovative sportswear, and performance gear.",
      logoUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
    },
  });

  const brandSamsung = await prisma.brand.create({
    data: {
      id: "brand-samsung",
      name: "Samsung",
      slug: "samsung",
      description:
        "Global innovator in displays, high-end smartphones, and digital home ecosystems.",
      logoUrl:
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=300&q=80",
    },
  });

  const brandBose = await prisma.brand.create({
    data: {
      id: "brand-bose",
      name: "Bose",
      slug: "bose",
      description:
        "Renowned pioneer of active noise-cancelling headphones and immersive personal audio.",
      logoUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
    },
  });

  const brandPatagonia = await prisma.brand.create({
    data: {
      id: "brand-patagonia",
      name: "Patagonia",
      slug: "patagonia",
      description:
        "Environmentally responsible outdoor clothing, insulated jackets, and adventure apparel.",
      logoUrl:
        "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=300&q=80",
    },
  });

  // 10. Seed Categories (Hierarchical: parents and children)
  console.log("🗂️ Seeding Categories...");
  const catElectronics = await prisma.category.create({
    data: {
      id: "cat-electronics",
      name: "Electronics",
      slug: "electronics",
      description:
        "Consumer tech, audio devices, computing, and smart accessories.",
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      id: "cat-audio",
      name: "Audio & Headphones",
      slug: "audio-headphones",
      parentId: catElectronics.id,
      description:
        "Wireless earbuds, studio monitors, and noise-cancelling headphones.",
    },
  });

  const catSmartphones = await prisma.category.create({
    data: {
      id: "cat-smartphones",
      name: "Smartphones & Tablets",
      slug: "smartphones-tablets",
      parentId: catElectronics.id,
      description:
        "Flagship smartphones, cellular wearables, and mobile computing.",
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      id: "cat-fashion",
      name: "Fashion & Apparel",
      slug: "fashion-apparel",
      description:
        "Trending streetwear, athletic apparel, and designer outerwear.",
    },
  });

  const catFootwear = await prisma.category.create({
    data: {
      id: "cat-footwear",
      name: "Footwear",
      slug: "footwear",
      parentId: catFashion.id,
      description: "Athletic runners, sneakers, boots, and casual shoes.",
    },
  });

  const catHome = await prisma.category.create({
    data: {
      id: "cat-home",
      name: "Home & Living",
      slug: "home-living",
      description:
        "Artisan kitchenware, interior lifestyle decor, and smart living appliances.",
    },
  });

  // 11. Seed Tags
  console.log("🏷️ Seeding Tags...");
  const tagNewArrival = await prisma.tag.create({
    data: { id: "tag-new-arrival", name: "New Arrival", slug: "new-arrival" },
  });
  const tagBestSeller = await prisma.tag.create({
    data: { id: "tag-best-seller", name: "Best Seller", slug: "best-seller" },
  });
  const tagWireless = await prisma.tag.create({
    data: { id: "tag-wireless", name: "Wireless", slug: "wireless" },
  });
  const tagPremium = await prisma.tag.create({
    data: { id: "tag-premium", name: "Premium Tier", slug: "premium-tier" },
  });
  const tagEcoFriendly = await prisma.tag.create({
    data: { id: "tag-eco", name: "Eco Friendly", slug: "eco-friendly" },
  });

  // 12. Seed Collections
  console.log("🌟 Seeding Collections...");
  const collectionTech = await prisma.collection.create({
    data: {
      id: "col-tech-prodigy",
      name: "Tech Prodigy 2026",
      slug: "tech-prodigy-2026",
      description:
        "Hand-curated pinnacle of wireless fidelity, personal computing, and mobile power.",
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      isActive: true,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
    },
  });

  const collectionSummer = await prisma.collection.create({
    data: {
      id: "col-summer-essentials",
      name: "Summer Performance Essentials",
      slug: "summer-performance-essentials",
      description:
        "Lightweight, breathable, and high-performance gear for active lifestyles.",
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      isActive: true,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-09-30"),
    },
  });

  // 13. Seed Products, Images, Variants, Tags, and Collection associations
  console.log("📦 Seeding Products, Images, Variants, and Stock...");

  // Product 1: iPhone 16 Pro Max
  const prodIphone = await prisma.product.create({
    data: {
      id: "prod-iphone-16-pro",
      name: "iPhone 16 Pro Max",
      slug: "iphone-16-pro-max",
      description:
        "Forged in Grade 5 titanium with the A18 Pro chip, camera control button, and all-day battery life.",
      shortDescription: "Titanium design, 48MP Fusion camera, A18 Pro silicon.",
      metaTitle: "Buy iPhone 16 Pro Max | completeme",
      metaDescription:
        "Experience the fastest smartphone with titanium construction and Pro camera system.",
      categoryId: catSmartphones.id,
      brandId: brandApple.id,
      vendorId: vendorProfile1.id,
      isActive: true,
      averageRating: 4.9,
      reviewCount: 48,
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        id: "img-iphone-1",
        productId: prodIphone.id,
        url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80",
        altText: "iPhone 16 Pro Max Natural Titanium front view",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: "img-iphone-2",
        productId: prodIphone.id,
        url: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=80",
        altText: "iPhone 16 Pro Max back camera cluster",
        sortOrder: 1,
        isPrimary: false,
      },
      {
        id: "img-iphone-3",
        productId: prodIphone.id,
        url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80",
        altText: "iPhone 16 Pro Max Super Retina XDR display handheld",
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: "img-iphone-4",
        productId: prodIphone.id,
        url: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=80",
        altText: "iPhone 16 Pro Max titanium edge profile",
        sortOrder: 3,
        isPrimary: false,
      },
    ],
  });

  const varIphone256 = await prisma.productVariant.create({
    data: {
      id: "var-iphone-256-nat",
      productId: prodIphone.id,
      sku: "IP16PM-256-NAT",
      price: 1678600.0,
      compareAtPrice: 1818600.0,
      stockQuantity: 45,
      weight: 0.22,
      attributes: { color: "Natural Titanium", storage: "256GB" },
    },
  });

  const varIphone512 = await prisma.productVariant.create({
    data: {
      id: "var-iphone-512-blk",
      productId: prodIphone.id,
      sku: "IP16PM-512-BLK",
      price: 1958600.0,
      compareAtPrice: 2098600.0,
      stockQuantity: 30,
      weight: 0.22,
      attributes: { color: "Black Titanium", storage: "512GB" },
    },
  });

  // Product 2: Sony WH-1000XM5
  const prodSonyHeadphones = await prisma.product.create({
    data: {
      id: "prod-sony-wh1000xm5",
      name: "Sony WH-1000XM5 Wireless Headphones",
      slug: "sony-wh-1000xm5-wireless-headphones",
      description:
        "Industry-leading noise cancellation powered by two processors and eight microphones with Auto NC Optimizer.",
      shortDescription:
        "Flagship wireless ANC over-ear headphones with 30h battery.",
      metaTitle: "Sony WH-1000XM5 Noise Cancelling Headphones",
      metaDescription:
        "Immerse yourself in pure sound with Sony WH-1000XM5 wireless ANC headphones.",
      categoryId: catAudio.id,
      brandId: brandSony.id,
      vendorId: vendorProfile1.id,
      isActive: true,
      averageRating: 4.8,
      reviewCount: 92,
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        id: "img-sony-1",
        productId: prodSonyHeadphones.id,
        url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80",
        altText: "Sony WH-1000XM5 in Midnight Black",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: "img-sony-2",
        productId: prodSonyHeadphones.id,
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
        altText: "Sony WH-1000XM5 side profile earcups",
        sortOrder: 1,
        isPrimary: false,
      },
      {
        id: "img-sony-3",
        productId: prodSonyHeadphones.id,
        url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80",
        altText: "Sony WH-1000XM5 audio workstation setup",
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: "img-sony-4",
        productId: prodSonyHeadphones.id,
        url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80",
        altText: "Sony WH-1000XM5 lifestyle listening experience",
        sortOrder: 3,
        isPrimary: false,
      },
    ],
  });

  const varSonyBlack = await prisma.productVariant.create({
    data: {
      id: "var-sony-xm5-blk",
      productId: prodSonyHeadphones.id,
      sku: "SNY-XM5-BLK",
      price: 559986.0,
      compareAtPrice: 601986.0,
      stockQuantity: 65,
      weight: 0.25,
      attributes: { color: "Midnight Black", style: "Over-Ear" },
    },
  });

  const varSonySilver = await prisma.productVariant.create({
    data: {
      id: "var-sony-xm5-slv",
      productId: prodSonyHeadphones.id,
      sku: "SNY-XM5-SLV",
      price: 559986.0,
      compareAtPrice: 601986.0,
      stockQuantity: 40,
      weight: 0.25,
      attributes: { color: "Silver White", style: "Over-Ear" },
    },
  });

  // Product 3: Nike Air Max Pulse
  const prodNikeSneakers = await prisma.product.create({
    data: {
      id: "prod-nike-airmax-pulse",
      name: "Nike Air Max Pulse Sneakers",
      slug: "nike-air-max-pulse-sneakers",
      description:
        "Pulling inspiration from the London music scene, the Air Max Pulse brings an underground touch to the iconic Air Max line.",
      shortDescription:
        "Next-generation point-loaded Air cushioning for responsive comfort.",
      metaTitle: "Nike Air Max Pulse Lifestyle Sneakers",
      metaDescription:
        "Elevate your stride with Nike Air Max Pulse athletic lifestyle sneakers.",
      categoryId: catFootwear.id,
      brandId: brandNike.id,
      vendorId: vendorProfile2.id,
      isActive: true,
      averageRating: 4.7,
      reviewCount: 35,
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        id: "img-nike-1",
        productId: prodNikeSneakers.id,
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
        altText: "Nike Air Max Pulse Crimson and Obsidian profile",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: "img-nike-2",
        productId: prodNikeSneakers.id,
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80",
        altText: "Nike Air Max Pulse top sole perspective",
        sortOrder: 1,
        isPrimary: false,
      },
      {
        id: "img-nike-3",
        productId: prodNikeSneakers.id,
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80",
        altText: "Nike Air Max Pulse heel Air unit cushioning",
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: "img-nike-4",
        productId: prodNikeSneakers.id,
        url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
        altText: "Nike Air Max Pulse street lifestyle perspective",
        sortOrder: 3,
        isPrimary: false,
      },
    ],
  });

  const varNikeSize10 = await prisma.productVariant.create({
    data: {
      id: "var-nike-pulse-10",
      productId: prodNikeSneakers.id,
      sku: "NKE-PLS-RED-10",
      price: 223986.0,
      compareAtPrice: 251986.0,
      stockQuantity: 28,
      weight: 0.85,
      attributes: { size: "US 10", color: "Crimson Red / Black" },
    },
  });

  const varNikeSize11 = await prisma.productVariant.create({
    data: {
      id: "var-nike-pulse-11",
      productId: prodNikeSneakers.id,
      sku: "NKE-PLS-RED-11",
      price: 223986.0,
      compareAtPrice: 251986.0,
      stockQuantity: 20,
      weight: 0.88,
      attributes: { size: "US 11", color: "Crimson Red / Black" },
    },
  });

  // Product 4: Bose QuietComfort Ultra
  const prodBoseEarbuds = await prisma.product.create({
    data: {
      id: "prod-bose-qc-ultra",
      name: "Bose QuietComfort Ultra Earbuds",
      slug: "bose-quietcomfort-ultra-earbuds",
      description:
        "Breakthrough spatialized audio for more immersive listening that makes your music feel more real than ever.",
      shortDescription:
        "CustomTune noise cancellation with spatial immersive audio.",
      metaTitle: "Bose QuietComfort Ultra True Wireless Earbuds",
      metaDescription:
        "World-class quiet and tailored acoustics with Bose QC Ultra earbuds.",
      categoryId: catAudio.id,
      brandId: brandBose.id,
      vendorId: vendorProfile1.id,
      isActive: true,
      averageRating: 4.85,
      reviewCount: 64,
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        id: "img-bose-1",
        productId: prodBoseEarbuds.id,
        url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80",
        altText: "Bose QuietComfort Ultra Earbuds with charging case open",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: "img-bose-2",
        productId: prodBoseEarbuds.id,
        url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80",
        altText: "Bose QuietComfort Ultra Earbuds single bud acoustic driver",
        sortOrder: 1,
        isPrimary: false,
      },
      {
        id: "img-bose-3",
        productId: prodBoseEarbuds.id,
        url: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80",
        altText: "Bose QuietComfort Ultra Earbuds pair on charging dock",
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: "img-bose-4",
        productId: prodBoseEarbuds.id,
        url: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1000&q=80",
        altText: "Bose QuietComfort Ultra Earbuds portable protective case",
        sortOrder: 3,
        isPrimary: false,
      },
    ],
  });

  const varBoseBlack = await prisma.productVariant.create({
    data: {
      id: "var-bose-qc-blk",
      productId: prodBoseEarbuds.id,
      sku: "BSE-QCULT-BLK",
      price: 418600.0,
      compareAtPrice: 460600.0,
      stockQuantity: 50,
      weight: 0.08,
      attributes: { color: "Triple Black" },
    },
  });

  // Product 5: Patagonia Nano Puff Jacket
  const prodPatagonia = await prisma.product.create({
    data: {
      id: "prod-patagonia-nano-puff",
      name: "Patagonia Nano Puff Insulated Jacket",
      slug: "patagonia-nano-puff-insulated-jacket",
      description:
        "Warm, windproof, water-resistant—the Nano Puff Jacket uses incredibly lightweight and highly compressible 60-g PrimaLoft Gold Insulation.",
      shortDescription:
        "100% recycled polyester shell with lightweight insulation.",
      metaTitle: "Patagonia Nano Puff Jacket | Sustainable Outdoor Apparel",
      metaDescription:
        "Stay warm in all elements with eco-friendly Patagonia Nano Puff jacket.",
      categoryId: catFashion.id,
      brandId: brandPatagonia.id,
      vendorId: vendorProfile2.id,
      isActive: true,
      averageRating: 4.95,
      reviewCount: 110,
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        id: "img-patagonia-1",
        productId: prodPatagonia.id,
        url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
        altText: "Patagonia Nano Puff Jacket in Forge Grey front view",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: "img-patagonia-2",
        productId: prodPatagonia.id,
        url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
        altText: "Patagonia Nano Puff Jacket alpine outdoor wear",
        sortOrder: 1,
        isPrimary: false,
      },
      {
        id: "img-patagonia-3",
        productId: prodPatagonia.id,
        url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80",
        altText: "Patagonia Nano Puff quilted stitching and zipper detail",
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: "img-patagonia-4",
        productId: prodPatagonia.id,
        url: "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1000&q=80",
        altText: "Patagonia Nano Puff Jacket hooded profile",
        sortOrder: 3,
        isPrimary: false,
      },
    ],
  });

  const varPatagoniaMedium = await prisma.productVariant.create({
    data: {
      id: "var-pat-nano-m",
      productId: prodPatagonia.id,
      sku: "PAT-NANO-GRY-M",
      price: 334600.0,
      compareAtPrice: 362600.0,
      stockQuantity: 35,
      weight: 0.34,
      attributes: { size: "Medium", color: "Forge Grey" },
    },
  });

  // 14. Seed Product Tags
  await prisma.productTag.createMany({
    data: [
      { productId: prodIphone.id, tagId: tagNewArrival.id },
      { productId: prodIphone.id, tagId: tagPremium.id },
      { productId: prodSonyHeadphones.id, tagId: tagWireless.id },
      { productId: prodSonyHeadphones.id, tagId: tagBestSeller.id },
      { productId: prodBoseEarbuds.id, tagId: tagWireless.id },
      { productId: prodBoseEarbuds.id, tagId: tagPremium.id },
      { productId: prodNikeSneakers.id, tagId: tagBestSeller.id },
      { productId: prodPatagonia.id, tagId: tagEcoFriendly.id },
    ],
  });

  // 15. Seed Collection Products
  await prisma.collectionProduct.createMany({
    data: [
      {
        collectionId: collectionTech.id,
        productId: prodIphone.id,
        sortOrder: 1,
      },
      {
        collectionId: collectionTech.id,
        productId: prodSonyHeadphones.id,
        sortOrder: 2,
      },
      {
        collectionId: collectionTech.id,
        productId: prodBoseEarbuds.id,
        sortOrder: 3,
      },
      {
        collectionId: collectionSummer.id,
        productId: prodNikeSneakers.id,
        sortOrder: 1,
      },
      {
        collectionId: collectionSummer.id,
        productId: prodPatagonia.id,
        sortOrder: 2,
      },
    ],
  });

  // 16. Seed Stock Transactions
  console.log("📊 Seeding Stock Transactions...");
  await prisma.stockTransaction.createMany({
    data: [
      {
        id: "st-iphone-init",
        variantId: varIphone256.id,
        quantity: 50,
        type: "RESTOCK",
        reference: "PO-APPLE-2026-001",
      },
      {
        id: "st-sony-init",
        variantId: varSonyBlack.id,
        quantity: 70,
        type: "RESTOCK",
        reference: "PO-SONY-2026-004",
      },
      {
        id: "st-nike-init",
        variantId: varNikeSize10.id,
        quantity: 30,
        type: "RESTOCK",
        reference: "PO-NIKE-2026-012",
      },
      {
        id: "st-nike-sale",
        variantId: varNikeSize10.id,
        quantity: -2,
        type: "SALE",
        reference: "ORD-INITIAL-TEST",
      },
    ],
  });

  // 17. Seed Wishlist Items
  console.log("❤️ Seeding Wishlist Items...");
  await prisma.wishlistItem.createMany({
    data: [
      {
        id: "wish-cust1-iphone",
        userId: customerUser1.id,
        productId: prodIphone.id,
      },
      {
        id: "wish-cust1-patagonia",
        userId: customerUser1.id,
        productId: prodPatagonia.id,
      },
      {
        id: "wish-cust2-sony",
        userId: customerUser2.id,
        productId: prodSonyHeadphones.id,
      },
    ],
  });

  // 18. Seed Cart Items
  console.log("🛒 Seeding Cart Items...");
  await prisma.cartItem.createMany({
    data: [
      {
        id: "cart-cust1-sony",
        userId: customerUser1.id,
        variantId: varSonyBlack.id,
        quantity: 1,
      },
      {
        id: "cart-cust1-bose",
        userId: customerUser1.id,
        variantId: varBoseBlack.id,
        quantity: 1,
      },
      {
        id: "cart-cust2-nike",
        userId: customerUser2.id,
        variantId: varNikeSize10.id,
        quantity: 2,
      },
    ],
  });

  // 19. Seed Coupons
  console.log("🎟️ Seeding Coupons...");
  const couponWelcome = await prisma.coupon.create({
    data: {
      id: "cpn-welcome-10",
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10.0,
      minOrderAmount: 70000.0,
      maxDiscount: 140000.0,
      usageLimit: 500,
      usedCount: 1,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  });

  const couponSave50 = await prisma.coupon.create({
    data: {
      id: "cpn-save-50",
      code: "SAVE50",
      discountType: "FIXED_AMOUNT",
      discountValue: 70000.0,
      minOrderAmount: 420000.0,
      maxDiscount: 70000.0,
      usageLimit: 200,
      usedCount: 0,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  });

  const couponFreeShip = await prisma.coupon.create({
    data: {
      id: "cpn-freeship",
      code: "FREESHIP",
      discountType: "FREE_SHIPPING",
      discountValue: 0.0,
      minOrderAmount: 105000.0,
      usageLimit: 1000,
      usedCount: 0,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  });

  // 20. Seed Orders, OrderItems, Payments, Shipments, and CouponUsage
  console.log("💳 Seeding Orders, Payments, and Shipments...");

  // Order 1: Completed order for customerUser1 (Delivered with tracking and payment)
  const order1 = await prisma.order.create({
    data: {
      id: "ord-2026-001",
      userId: customerUser1.id,
      couponId: couponWelcome.id,
      totalAmount: 1580740.0,
      taxAmount: 119000.0,
      shippingAmount: 0.0,
      discountAmount: 167860.0,
      status: "DELIVERED",
      shippingAddressId: addressCust1Shipping.id,
    },
  });

  await prisma.orderItem.create({
    data: {
      id: "oi-ord1-iphone",
      orderId: order1.id,
      variantId: varIphone256.id,
      quantity: 1,
      priceAtPurchase: 1678600.0,
    },
  });

  await prisma.couponUsage.create({
    data: {
      id: "usage-cpn-ord1",
      couponId: couponWelcome.id,
      userId: customerUser1.id,
      orderId: order1.id,
    },
  });

  await prisma.payment.create({
    data: {
      id: "pay-ord1-stripe",
      orderId: order1.id,
      paymentMethod: "MTN MoMo Pay",
      transactionId: "momo-seed-2026-001",
      amount: 1580740.0,
      status: "COMPLETED",
    },
  });

  await prisma.shipment.create({
    data: {
      id: "ship-ord1-fedex",
      orderId: order1.id,
      carrier: "FedEx Priority",
      trackingNumber: "FDX-748291038291",
      status: "DELIVERED",
      estimatedDelivery: new Date("2026-09-08"),
      shippedAt: new Date("2026-09-06"),
      deliveredAt: new Date("2026-09-08"),
    },
  });

  // Order 2: In-transit order for customerUser2
  const order2 = await prisma.order.create({
    data: {
      id: "ord-2026-002",
      userId: customerUser2.id,
      totalAmount: 608986.0,
      taxAmount: 35000.0,
      shippingAmount: 14000.0,
      discountAmount: 0.0,
      status: "SHIPPED",
      shippingAddressId: addressCust2.id,
    },
  });

  await prisma.orderItem.create({
    data: {
      id: "oi-ord2-sony",
      orderId: order2.id,
      variantId: varSonyBlack.id,
      quantity: 1,
      priceAtPurchase: 559986.0,
    },
  });

  await prisma.payment.create({
    data: {
      id: "pay-ord2-paypal",
      orderId: order2.id,
      paymentMethod: "Airtel Pay",
      transactionId: "airtel-seed-2026-002",
      amount: 608986.0,
      status: "COMPLETED",
    },
  });

  await prisma.shipment.create({
    data: {
      id: "ship-ord2-dhl",
      orderId: order2.id,
      carrier: "DHL Express",
      trackingNumber: "DHL-984729183749",
      status: "IN_TRANSIT",
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // 21. Seed Product Reviews
  console.log("⭐ Seeding Product Reviews...");
  await prisma.productReview.createMany({
    data: [
      {
        id: "rev-iphone-1",
        productId: prodIphone.id,
        userId: customerUser1.id,
        rating: 5,
        title: "Phenomenal build quality and battery!",
        comment:
          "The titanium finish feels incredible in hand and the battery easily lasts 1.5 days of heavy use.",
        isVerified: true,
        isApproved: true,
      },
      {
        id: "rev-sony-1",
        productId: prodSonyHeadphones.id,
        userId: customerUser2.id,
        rating: 5,
        title: "Best ANC on the market hands down",
        comment:
          "Flies with me on long-haul flights. Blocks airplane engine drone like magic. Highly recommended!",
        isVerified: true,
        isApproved: true,
      },
      {
        id: "rev-nike-1",
        productId: prodNikeSneakers.id,
        userId: customerUser1.id,
        rating: 4,
        title: "Super comfortable for all-day walking",
        comment:
          "Very stylish and the air cushioning is soft. Runs slightly snug so consider half a size up.",
        isVerified: true,
        isApproved: true,
      },
    ],
  });

  // 22. Seed Audit Logs
  console.log("📝 Seeding Audit Logs...");
  await prisma.auditLog.createMany({
    data: [
      {
        id: "audit-init-0001",
        userId: adminUser.id,
        action: "STORE_INIT",
        entity: "System",
        entityId: "system-root",
        newValues: { message: "completeme seed data loaded successfully" },
        ipAddress: "127.0.0.1",
      },
      {
        id: "audit-init-0002",
        userId: vendorUser1.id,
        action: "PRODUCT_PUBLISH",
        entity: "Product",
        entityId: prodIphone.id,
        newValues: {
          name: prodIphone.name,
          sku: varIphone256.sku,
          stock: varIphone256.stockQuantity,
        },
        ipAddress: "127.0.0.1",
      },
      {
        id: "audit-init-0003",
        userId: customerUser1.id,
        action: "ORDER_CHECKOUT",
        entity: "Order",
        entityId: order1.id,
        newValues: { totalAmount: 1580740.0, status: "DELIVERED" },
        ipAddress: "127.0.0.1",
      },
    ],
  });

  // 23. Seed Blog Posts
  console.log("📰 Seeding Blog Posts...");
  await prisma.blogPost.createMany({
    data: [
      {
        id: "post-0001",
        title: "The Ultimate Guide to Noise-Canceling & Wireless Audio in 2026",
        slug: "ultimate-wireless-headphones-guide-2026",
        excerpt:
          "Whether you are working in a bustling cafe or commuting on busy transit, discovering the right blend of active noise cancellation (ANC), battery endurance, and acoustic clarity makes all the difference.",
        content:
          "Wireless audio technology has advanced significantly in recent years. Modern Active Noise Cancellation (ANC) no longer produces that uncomfortable ear-pressure sensation, and battery performance routinely surpasses 30 hours on a single charge.\n\nWhen choosing your daily drivers, consider three primary elements:\n1. Driver Architecture: Look for custom neodymium drivers that deliver balanced soundstage rather than overwhelming artificial bass.\n2. Codec Support: AAC and LDAC support are vital for high-resolution streaming from modern smartphones.\n3. Ergonomics and Weight: Lightweight ear cushions with breathable memory foam make extended listening sessions fatigue-free.",
        category: "Audio & Tech",
        readTime: "6 min read",
        author: "Marcus Vance",
        authorRole: "Audio Specialist",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
        isFeatured: true,
        isPublished: true,
      },
      {
        id: "post-0002",
        title:
          "Curating a Minimalist Everyday Carry: What Deserves a Place in Your Pocket",
        slug: "minimalist-everyday-carry-essentials",
        excerpt:
          "From slim cardholders to compact multi-tools and high-precision wristwear, here is how intentional curation can declutter your day-to-day commute.",
        content:
          "Everyday Carry (EDC) is the philosophy of keeping only what is essential, durable, and thoughtfully designed close at hand.\n\nBy eliminating bulk, your everyday transit becomes more streamlined and enjoyable. Choose multi-functional tools crafted from aviation-grade aluminum or titanium, and invest in a durable leather or metal cardholder that protects your cards with RFID shielding.",
        category: "Lifestyle",
        readTime: "4 min read",
        author: "Elena Rostova",
        authorRole: "Lifestyle Editor",
        authorAvatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
        isFeatured: false,
        isPublished: true,
      },
      {
        id: "post-0003",
        title:
          "Smartwatch vs. Mechanical Watch: Bridging Utility and Timeless Craftsmanship",
        slug: "smartwatch-vs-mechanical-watch-guide",
        excerpt:
          "Can modern haptic health tracking coexist with classic mechanical horology? We analyze when to sport digital intelligence and when to reach for automatic watchmaking.",
        content:
          "Can modern haptic health tracking coexist with classic mechanical horology? We analyze when to sport digital intelligence and when to reach for automatic watchmaking.",
        category: "Style & Watches",
        readTime: "5 min read",
        author: "Jean-Paul Habimana",
        authorRole: "Horology Contributor",
        authorAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        image:
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
        isFeatured: false,
        isPublished: true,
      },
      {
        id: "post-0004",
        title:
          "Smart Shopper's Handbook: How to Spot Genuine Discounts vs. Inflated RRPs",
        slug: "how-to-spot-genuine-tech-deals",
        excerpt:
          "Demystifying markdown tactics, seasonal price drops, and clearance cycles so you always get maximum value on every gadget and accessory.",
        content:
          "Demystifying markdown tactics, seasonal price drops, and clearance cycles so you always get maximum value on every gadget and accessory.",
        category: "Buying Guides",
        readTime: "7 min read",
        author: "Sophie Chen",
        authorRole: "Consumer Insights Lead",
        authorAvatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
        image:
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80",
        isFeatured: false,
        isPublished: true,
      },
      {
        id: "post-0005",
        title:
          "Behind the Scenes: Our Commitment to Plastic-Free Delivery & Recycled Tech",
        slug: "eco-conscious-packaging-and-circular-electronics",
        excerpt:
          "A deep dive into our warehouse sustainability initiatives, biodegradable cushioning, and repairable component certifications.",
        content:
          "A deep dive into our warehouse sustainability initiatives, biodegradable cushioning, and repairable component certifications.",
        category: "Sustainability",
        readTime: "4 min read",
        author: "Marcus Vance",
        authorRole: "Audio Specialist",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        image:
          "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80",
        isFeatured: false,
        isPublished: true,
      },
      {
        id: "post-0006",
        title:
          "5 Proven Habits to Extend the Lifespan of Your Wireless Earbuds & Smart Devices",
        slug: "preserving-battery-health-on-wearables",
        excerpt:
          "Stop degrading your lithium-ion cells prematurely. Simple charging rhythms and storage temperatures that keep batteries performing like new.",
        content:
          "Stop degrading your lithium-ion cells prematurely. Simple charging rhythms and storage temperatures that keep batteries performing like new.",
        category: "Audio & Tech",
        readTime: "3 min read",
        author: "Jean-Paul Habimana",
        authorRole: "Horology Contributor",
        authorAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        image:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
        isFeatured: false,
        isPublished: true,
      },
    ],
  });

  // 24. Seed Contact Inquiries
  console.log("💬 Seeding Contact Inquiries...");
  await prisma.contactInquiry.createMany({
    data: [
      {
        id: "inq-0001",
        name: "David Ndahiro",
        email: "david.n@example.com",
        orderNumber: "ORD-1002",
        subject: "order",
        message:
          "Hello, I wanted to check if my order can be expedited for delivery before Friday afternoon. Thank you!",
        status: "PENDING",
      },
      {
        id: "inq-0002",
        name: "Aline Umutoni",
        email: "aline.u@example.com",
        subject: "payment",
        message:
          "Can I pay using MTN MoMo Pay directly at pickup, or should I dial the USSD code right after checkout?",
        status: "RESOLVED",
      },
      {
        id: "inq-0003",
        name: "Patrick Mugabo",
        email: "patrick.m@example.com",
        subject: "product",
        message:
          "Do you offer international warranty coverage on the Sony WH-1000XM5 headphones?",
        status: "PENDING",
      },
    ],
  });

  // 30. Seed StoreSetting (Site settings in database)
  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      values: {
        storeName: "completeme",
        storeEmail: "hello@completeme.com",
        storePhone: "+250 788 000 000",
        storeAddress: "Kigali Heights, KG 7 Ave, Kigali, Rwanda",
        logoUrl: "",
        currency: "RWF",
        currencySymbol: "FRw",
        timezone: "Africa/Kigali",
        freeShippingThreshold: "70000",
        flatShippingRate: "8000",
        enableFreeShipping: true,
        enableLocalPickup: false,
        taxRate: "8",
        taxIncludedInPrice: false,
        orderPrefix: "SP-",
        lowStockThreshold: "10",
        allowGuestCheckout: true,
        enableReviews: true,
        enableWishlist: true,
        enableMomoPay: true,
        momoPayCode: "*182*8*1*000000#",
        momoMerchantName: "completeme",
        enableAirtelPay: true,
        airtelPayCode: "*182*8*1*000000#",
        airtelMerchantName: "completeme",
        enableCardPayment: true,
        paymentInstructions:
          "Dial the payment code on your mobile phone, verify merchant name and amount, enter your PIN to authorize payment, then enter your phone number and transaction reference below.",
        metaTitle: "completeme — Everyday essentials",
        metaDescription: "Curated audio, watches, and accessories made to last.",
        facebookUrl: "https://facebook.com/",
        instagramUrl: "https://instagram.com/",
        twitterUrl: "https://x.com/",
        youtubeUrl: "https://youtube.com/@",
        tiktokUrl: "https://tiktok.com/@",
        linkedinUrl: "https://linkedin.com/company/",
        pinterestUrl: "https://pinterest.com/",
        whatsappUrl: "https://wa.me/",
        enableTopBar: true,
        topBarText:
          "Free shipping on orders over FRw 70,000 | Use code WELCOME10 for 10% off",
        topBarLink: "/products",
        topBarLinkText: "Shop Now",
        enablePromoBanner: true,
        promoBadge: "Limited time offer",
        promoTitle: "Up to 30% off sound & style",
        promoDescription:
          "Handpicked headphones, watches, and accessories at their best prices this season. Free shipping on orders over FRw 70,000.",
        promoButtonText: "Shop the sale",
        promoButtonLink: "/deals",
        promoImageUrl: "/image/watch.webp",
        enableNewsletter: true,
        newsletterTitle: "Stay in the loop",
        newsletterSubtitle:
          "New drops, early access, and the occasional sale — no spam, ever.",
        newsletterButtonText: "Subscribe",
        brandSectionTitle: "Trusted by brands you know",
      },
    },
  });

  console.log("\n🎉 Database seeded successfully with all 30 models!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Default Seed User Accounts (Password: Password123!)");
  console.log("  • Admin:    admin@completeme.com       (Role: ADMIN)");
  console.log(
    "  • Vendor 1: marcus@auratech.com       (Role: VENDOR - Aura Tech Global)",
  );
  console.log(
    "  • Vendor 2: elena@velvetvine.com      (Role: VENDOR - Velvet & Vine)",
  );
  console.log("  • Customer: lucas.vance@example.com   (Role: CUSTOMER)");
  console.log("  • Customer: sophia.m@example.com      (Role: CUSTOMER)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  await clearAppCache();
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (redis) {
      await redis.quit();
    }
  });
