import { prisma } from "../lib/prisma";

export const DEFAULT_SETTINGS = {
  storeName: "Shop Pulse",
  storeEmail: "hello@shoppulse.com",
  storePhone: "+1 (234) 567-890",
  storeAddress: "123 Market St, San Francisco, CA 94103",
  logoUrl: "",

  currency: "USD",
  currencySymbol: "$",
  timezone: "America/Los_Angeles",

  freeShippingThreshold: "50",
  flatShippingRate: "5.99",
  enableFreeShipping: true,
  enableLocalPickup: false,

  taxRate: "8",
  taxIncludedInPrice: false,

  orderPrefix: "SP-",
  lowStockThreshold: "10",
  allowGuestCheckout: true,
  enableReviews: true,
  enableWishlist: true,

  // Mobile Money & Payment Methods
  enableMomoPay: true,
  momoPayCode: "*182*8*1*000000#",
  momoMerchantName: "Shop Pulse",
  enableAirtelPay: true,
  airtelPayCode: "*182*8*1*000000#",
  airtelMerchantName: "Shop Pulse",
  enableCardPayment: true,
  paymentInstructions: "Dial the payment code on your mobile phone, verify merchant name and amount, enter your PIN to authorize payment, then enter your phone number and transaction reference below.",

  metaTitle: "Shop Pulse — Everyday essentials",
  metaDescription: "Curated audio, watches, and accessories made to last.",

  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",

  // Top Navbar / Announcement Bar
  enableTopBar: true,
  topBarText: "Free shipping on orders over $50 | Use code WELCOME10 for 10% off",
  topBarLink: "/products",
  topBarLinkText: "Shop Now",

  // Promo Banner
  enablePromoBanner: true,
  promoBadge: "Limited time offer",
  promoTitle: "Up to 30% off sound & style",
  promoDescription: "Handpicked headphones, watches, and accessories at their best prices this season. Free shipping on orders over $50.",
  promoButtonText: "Shop the sale",
  promoButtonLink: "/deals",
  promoImageUrl: "/image/watch.webp",

  // Newsletter Banner
  enableNewsletter: true,
  newsletterTitle: "Stay in the loop",
  newsletterSubtitle: "New drops, early access, and the occasional sale — no spam, ever.",
  newsletterButtonText: "Subscribe",

  // Brand Section
  brandSectionTitle: "Trusted by brands you know",
};

export const settingsService = {
  getSettings: async () => {
    try {
      const record = await prisma.storeSetting.findUnique({
        where: { id: "default" },
      });

      if (!record || !record.values) {
        // Initialize default
        const created = await prisma.storeSetting.upsert({
          where: { id: "default" },
          update: {},
          create: {
            id: "default",
            values: DEFAULT_SETTINGS,
          },
        });
        return (created.values as any) || DEFAULT_SETTINGS;
      }

      return {
        ...DEFAULT_SETTINGS,
        ...(typeof record.values === "object" ? record.values : {}),
      };
    } catch (err) {
      console.error("Failed to read settings from DB:", err);
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings: async (newValues: Record<string, any>) => {
    try {
      const current = await settingsService.getSettings();
      const merged = { ...current, ...newValues };

      const updated = await prisma.storeSetting.upsert({
        where: { id: "default" },
        update: {
          values: merged,
        },
        create: {
          id: "default",
          values: merged,
        },
      });

      return (updated.values as any) || merged;
    } catch (err) {
      console.error("Failed to update settings in DB:", err);
      return { ...DEFAULT_SETTINGS, ...newValues };
    }
  },
};
