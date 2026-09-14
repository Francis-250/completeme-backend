import { prisma } from "../lib/prisma";

const INITIAL_BLOG_POSTS = [
  {
    title: "The Ultimate Guide to Noise-Canceling & Wireless Audio in 2026",
    slug: "ultimate-wireless-headphones-guide-2026",
    excerpt:
      "Whether you are working in a bustling cafe or commuting on busy transit, discovering the right blend of active noise cancellation (ANC), battery endurance, and acoustic clarity makes all the difference.",
    content: `Wireless audio technology has advanced significantly in recent years. Modern Active Noise Cancellation (ANC) no longer produces that uncomfortable ear-pressure sensation, and battery performance routinely surpasses 30 hours on a single charge.

When choosing your daily drivers, consider three primary elements:
1. Driver Architecture: Look for custom neodymium drivers that deliver balanced soundstage rather than overwhelming artificial bass.
2. Codec Support: AAC and LDAC support are vital for high-resolution streaming from modern smartphones.
3. Ergonomics and Weight: Lightweight ear cushions with breathable memory foam make extended listening sessions fatigue-free.`,
    category: "Audio & Tech",
    readTime: "6 min read",
    author: "Marcus Vance",
    authorRole: "Audio Specialist",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
    isFeatured: true,
  },
  {
    title:
      "Curating a Minimalist Everyday Carry: What Deserves a Place in Your Pocket",
    slug: "minimalist-everyday-carry-essentials",
    excerpt:
      "From slim cardholders to compact multi-tools and high-precision wristwear, here is how intentional curation can declutter your day-to-day commute.",
    content: `Everyday Carry (EDC) is the philosophy of keeping only what is essential, durable, and thoughtfully designed close at hand. 

By eliminating bulk, your everyday transit becomes more streamlined and enjoyable. Choose multi-functional tools crafted from aviation-grade aluminum or titanium, and invest in a durable leather or metal cardholder that protects your cards with RFID shielding.`,
    category: "Lifestyle",
    readTime: "4 min read",
    author: "Elena Rostova",
    authorRole: "Lifestyle Editor",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    isFeatured: false,
  },
  {
    title:
      "Smartwatch vs. Mechanical Watch: Bridging Utility and Timeless Craftsmanship",
    slug: "smartwatch-vs-mechanical-watch-guide",
    excerpt:
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
  },
  {
    title:
      "Smart Shopper's Handbook: How to Spot Genuine Discounts vs. Inflated RRPs",
    slug: "how-to-spot-genuine-tech-deals",
    excerpt:
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
  },
  {
    title:
      "Behind the Scenes: Our Commitment to Plastic-Free Delivery & Recycled Tech",
    slug: "eco-conscious-packaging-and-circular-electronics",
    excerpt:
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
  },
  {
    title:
      "5 Proven Habits to Extend the Lifespan of Your Wireless Earbuds & Smart Devices",
    slug: "preserving-battery-health-on-wearables",
    excerpt:
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
  },
];

export const blogService = {
  seedIfEmpty: async () => {
    const count = await prisma.blogPost.count();
    if (count === 0) {
      for (const post of INITIAL_BLOG_POSTS) {
        await prisma.blogPost.create({
          data: post,
        });
      }
    }
  },

  getAll: async (
    options: {
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    await blogService.seedIfEmpty();

    const { category, search, page = 1, limit = 20 } = options;
    const where: any = { isPublished: true };

    if (category && category !== "All") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  getBySlug: async (slug: string) => {
    await blogService.seedIfEmpty();
    return prisma.blogPost.findUnique({
      where: { slug },
    });
  },

  create: async (data: {
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    category: string;
    image?: string;
    author?: string;
    authorRole?: string;
    authorAvatar?: string;
    readTime?: string;
    isFeatured?: boolean;
  }) => {
    return prisma.blogPost.create({
      data,
    });
  },

  update: async (id: string, data: any) => {
    return prisma.blogPost.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.blogPost.delete({
      where: { id },
    });
  },
};
