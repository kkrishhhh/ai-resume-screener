import { Redis } from '@upstash/redis'

let _redis: Redis | null = null;

function getRedis(): Redis {
    if (!_redis) {
        const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
        const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

        if (!url || !token) {
            throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
        }

        _redis = new Redis({ url, token });
    }
    return _redis;
}

export async function rateLimit(identifier: string, limit: number, windowSeconds: number) {
    const redis = getRedis();
    const key = `ratelimit:${identifier}`;
    const currentCount = await redis.incr(key);

    // If it's the first request in the window, set the expiry
    if (currentCount === 1) {
        await redis.expire(key, windowSeconds);
    }

    return {
        success: currentCount <= limit,
        limit,
        remaining: Math.max(0, limit - currentCount),
    };
}
