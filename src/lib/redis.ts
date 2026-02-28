import { Redis } from '@upstash/redis'

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(identifier: string, limit: number, windowSeconds: number) {
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
