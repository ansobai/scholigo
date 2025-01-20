import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

type Options = {
    uniqueTokenPerInterval?: number;
    interval?: number;
};

/**
 * Creates a rate limiter using an LRU cache to store token usage.
 *
 * @param {Options} [options] - Configuration options for the rate limiter.
 * @param {number} [options.uniqueTokenPerInterval=500] - Maximum unique tokens allowed per interval.
 * @param {number} [options.interval=60000] - Interval duration in milliseconds.
 * @returns {Object} The rate limiter with a check function.
 */
export function rateLimit(options?: Options) {
    const tokenCache = new LRUCache({
        max: options?.uniqueTokenPerInterval || 500,
        ttl: options?.interval || 60000,
    });

    return {
      /**
       * Checks if a request exceeds the rate limit.
       *
       * @param {NextRequest} req - The incoming request object.
       * @param {number} limit - The maximum number of allowed requests.
       * @param {string} token - The unique token identifying the requester.
       * @returns {Promise<void>} A promise that resolves if the request is within the limit, otherwise rejects.
       */
      check: (req: NextRequest, limit: number, token: string): Promise<void> =>
        new Promise<void>((resolve, reject) => {
          const tokenCount = (tokenCache.get(token) as number[]) || [0];
          if (tokenCount[0] === 0) {
            tokenCache.set(token, tokenCount);
          }
          tokenCount[0] += 1;

          const currentUsage = tokenCount[0];
          const isRateLimited = currentUsage >= limit;
          req.headers.set("X-RateLimit-Limit", limit.toString());
          req.headers.set(
            "X-RateLimit-Remaining",
            isRateLimited ? "0" : (limit - currentUsage).toString(),
          );

          return isRateLimited ? reject() : resolve();
        }),
    };
}