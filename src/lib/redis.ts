import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL!;
let isConnected = false;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  connectTimeout: 5000,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 5) {
      console.warn("Redis retry limit reached. Continuing in degraded fallback mode.");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => {
  isConnected = true;
  console.log("Redis connected successfully.");
});

redis.on("ready", () => {
  isConnected = true;
  console.log("Redis ready to accept commands.");
});

redis.on("error", (err) => {
  isConnected = false;
  console.warn("Redis connection warning (falling back to database):", err.message);
});

redis.on("close", () => {
  isConnected = false;
});

// Eagerly initiate connection in background
redis.connect().catch((err) => {
  console.warn("Initial Redis connection failed (will fallback to database):", err.message);
});

export const isRedisReady = (): boolean => isConnected;

/**
 * Get cached item parsed from JSON
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!isConnected) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`Redis getCache failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Set cached item with JSON serialization and optional TTL (seconds)
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 600,
): Promise<boolean> {
  if (!isConnected) return false;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (err) {
    console.warn(`Redis setCache failed for key "${key}":`, err);
    return false;
  }
}

/**
 * Delete one or more specific cache keys
 */
export async function delCache(...keys: string[]): Promise<number> {
  if (!isConnected || keys.length === 0) return 0;
  try {
    const validKeys = keys.filter(Boolean);
    if (validKeys.length === 0) return 0;
    return await redis.del(...validKeys);
  } catch (err) {
    console.warn("Redis delCache failed:", err);
    return 0;
  }
}

/**
 * Non-blocking pattern deletion using Redis SCAN
 * Purges all keys matching a wildcard pattern (e.g. "products:*", "categories:*")
 */
export async function delCachePattern(pattern: string): Promise<number> {
  if (!isConnected) return 0;
  try {
    let cursor = "0";
    let totalDeleted = 0;

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
        const deleted = await redis.del(...keys);
        totalDeleted += deleted;
      }
    } while (cursor !== "0");

    return totalDeleted;
  } catch (err) {
    console.warn(`Redis delCachePattern failed for pattern "${pattern}":`, err);
    return 0;
  }
}

/**
 * Flush all cache entries matching standard application namespaces
 */
export async function invalidateAppCaches(): Promise<void> {
  await Promise.allSettled([
    delCachePattern("products:*"),
    delCachePattern("product:*"),
    delCachePattern("categories:*"),
    delCachePattern("category:*"),
    delCachePattern("brands:*"),
    delCachePattern("brand:*"),
    delCachePattern("deals:*"),
    delCachePattern("collections:*"),
    delCachePattern("collection:*"),
    delCachePattern("tags:*"),
    delCachePattern("tag:*"),
    delCachePattern("settings:*"),
  ]);
}
