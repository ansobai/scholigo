import 'server-only'
import Redis, { RedisOptions } from "ioredis";

export class Cache {
    private static instance: Cache;
    private static redisClient: Redis;

    private constructor() {
        const redisConfig: RedisOptions = {
            db: 2,
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379'),
            retryStrategy: (times) => {
                return Math.min(times * 50, 2000);
            },
            lazyConnect: true,
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            autoResubscribe: true,
            autoResendUnfulfilledCommands: true,
            reconnectOnError: (err: Error) => {
                const targetError = 'READONLY';
                return err.message.includes(targetError);
            },
        };

        if (!Cache.redisClient) {
            Cache.redisClient = new Redis(redisConfig);

            Cache.redisClient.on('connect', () => {
                console.log('Connected to Redis');
            });

            Cache.redisClient.on('error', (err) => {
                console.error('Redis error:', err);
            });

            Cache.redisClient.on('close', () => {
                console.log('Redis connection closed');
            });

            Cache.redisClient.on('reconnecting', () => {
                console.log('Redis reconnecting');
            });
        }
    }

    /**
     * Retrieves the Redis client instance.
     *
     * @returns {Redis} The Redis client instance.
     */
    public getClient(): Redis {
        return Cache.redisClient;
    }

    /**
     * Retrieves the singleton instance of the Cache.
     *
     * @returns {Cache} The singleton instance.
     */
    public static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }

        return Cache.instance;
    }
}