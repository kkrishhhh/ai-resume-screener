import { Redis } from '@upstash/redis'

let _redis: Redis | null = null;

function getRedis(): Redis {
    if (!_redis) {
        _redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
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
