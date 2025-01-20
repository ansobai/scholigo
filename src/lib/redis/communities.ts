import 'server-only'

import {Cache} from "@/lib/redis/redis";
import Redis from "ioredis";

export class CommunitiesCache {
    private static instance: CommunitiesCache;
    private redisClient: Redis;

    private readonly COMMUNITIES_KEY_PREFIX = "communities";
    private readonly COMMUNITIES_EXPIRATION = 3600; // 1 hour

    private constructor() {
        this.redisClient = Cache.getInstance().getClient()
    }

    /**
     * Retrieves a value from the cache.
     *
     * @param {string} key - The key to retrieve the value for.
     * @returns {Promise<T | null>} The cached value or null if not found.
     */
    public async getValue<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redisClient.get(`${this.COMMUNITIES_KEY_PREFIX}-${key}`);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('getValue Error:', error);
            return null;
        }
    }

    /**
     * Sets a value in the cache.
     *
     * @param {string} key - The key to set the value for.
     * @param {T} value - The value to set.
     * @param {number} [ttl=this.COMMUNITIES_EXPIRATION] - The time-to-live for the cache entry in seconds.
     * @returns {Promise<boolean>} True if the value was set successfully, false otherwise.
     */
    public async setValue<T>(key: string, value: T, ttl: number = this.COMMUNITIES_EXPIRATION): Promise<boolean> {
        try {
            const stringValue = JSON.stringify(value);

            if (ttl) {
                await this.redisClient.setex(`${this.COMMUNITIES_KEY_PREFIX}-${key}`, ttl, stringValue);
            } else {
                await this.redisClient.set(`${this.COMMUNITIES_KEY_PREFIX}-${key}`, stringValue);
            }

            return true;
        } catch (error) {
            console.error('setValue Error:', error);
            return false;
        }
    }

    /**
     * Retrieves a value from the cache or sets it using a fallback function if not found.
     *
     * @param {string} key - The key to retrieve the value for.
     * @param {() => Promise<T>} fallbackFn - The fallback function to generate the value if not found in cache.
     * @param {number} [ttl=this.COMMUNITIES_EXPIRATION] - The time-to-live for the cache entry in seconds.
     * @returns {Promise<T | null>} The cached or newly generated value.
     */
    public async getOrSetValue<T>(key: string, fallbackFn: () => Promise<T>, ttl: number = this.COMMUNITIES_EXPIRATION): Promise<T | null> {
        try {
            const cachedValue = await this.getValue<T>(key);

            if (cachedValue !== null) {
                return cachedValue;
            }

            const value = await fallbackFn();
            await this.setValue(key, value, ttl);
            return value;
        } catch (error) {
            console.error('getOrSetValue Error:', error);
            return null;
        }
    }

    /**
     * Retrieves multiple values from the cache.
     *
     * @param {string[]} keys - The keys to retrieve the values for.
     * @returns {Promise<Record<string, T | null>>} An object containing the cached values or null if not found.
     */
    public async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
        try {
            const pipeline = this.redisClient.pipeline();
            for (const key of keys) {
                pipeline.get(`${this.COMMUNITIES_KEY_PREFIX}-${key}`);
            }

            type PipelineResult = [Error | null, string | null][] | null;
            const results = (await pipeline.exec()) as PipelineResult;
            const output: Record<string, T | null> = {};

            if (!results) {
                return output;
            }

            keys.forEach((key, index) => {
                const result = results[index];
                if (result) {
                    const [err, value] = result;
                    if (!err && value) {
                        try {
                            output[key] = JSON.parse(value);
                        } catch {
                            output[key] = null;
                        }
                    } else {
                        output[key] = null;
                    }
                } else {
                    output[key] = null;
                }
            });

            return output;
        } catch (error) {
            console.error('getMultiple Error:', error);
            return {};
        }
    }

    /**
     * Sets multiple values in the cache.
     *
     * @param {Record<string, T>} keyValuePairs - The key-value pairs to set in the cache.
     * @param {number} [ttl=this.COMMUNITIES_EXPIRATION] - The time-to-live for the cache entries in seconds.
     * @param {number} [batchSize=1000] - The number of entries to set in each batch.
     * @returns {Promise<boolean>} True if the values were set successfully, false otherwise.
     */
    public async setBulkValue<T>(keyValuePairs: Record<string, T>, ttl: number = this.COMMUNITIES_EXPIRATION, batchSize = 1000): Promise<boolean> {
        try {
            const entries = Object.entries(keyValuePairs);
            for (let i = 0; i < entries.length; i += batchSize) {
                const batch = entries.slice(i, i + batchSize);
                const pipeline = this.redisClient.pipeline();

                for (const [key, value] of batch) {
                    const stringValue = JSON.stringify(value);
                    if (ttl) {
                        pipeline.setex(`${this.COMMUNITIES_KEY_PREFIX}-${key}`, ttl, stringValue);
                    } else {
                        pipeline.set(`${this.COMMUNITIES_KEY_PREFIX}-${key}`, stringValue);
                    }
                }

                await pipeline.exec();
            }
            return true;
        } catch (error) {
            console.error('setBulkValue Error:', error);
            return false;
        }
    }

    /**
     * Deletes a value from the cache.
     *
     * @param {string} key - The key to delete the value for.
     * @returns {Promise<boolean>} True if the value was deleted successfully, false otherwise.
     */
    public async delete(key: string): Promise<boolean> {
        try {
            await this.redisClient.del(`${this.COMMUNITIES_KEY_PREFIX}-${key}`);
            return true;
        } catch (error) {
            console.error('delete Error:', error);
            return false;
        }
    }

    /**
     * Checks if a key exists in the cache.
     *
     * @param {string} key - The key to check for existence.
     * @returns {Promise<boolean>} True if the key exists, false otherwise.
     */
    public async exists(key: string): Promise<boolean> {
        try {
            return (await this.redisClient.exists(`${this.COMMUNITIES_KEY_PREFIX}-${key}`)) === 1;
        } catch (error) {
            console.error('exists Error:', error);
            return false;
        }
    }

    /**
     * Retrieves the time-to-live (TTL) of a key in the cache.
     *
     * @param {string} key - The key to retrieve the TTL for.
     * @returns {Promise<number>} The TTL in seconds, or -1 if an error occurs.
     */
    public async getTTL(key: string): Promise<number> {
        try {
            return await this.redisClient.ttl(`${this.COMMUNITIES_KEY_PREFIX}-${key}`);
        } catch (error) {
            console.error('getTTL Error:', error);
            return -1;
        }
    }

    /**
     * Retrieves keys matching a pattern from the cache.
     *
     * @param {string} pattern - The pattern to match keys against.
     * @returns {Promise<string[]>} An array of keys matching the pattern.
     */
    public async getKeys(pattern: string): Promise<string[]> {
        try {
            return await this.redisClient.keys(`${this.COMMUNITIES_KEY_PREFIX}-${pattern}`);
        } catch (error) {
            console.error('getKeys Error:', error);
            return [];
        }
    }

    /**
     * Deletes multiple keys from the cache.
     *
     * @param {string[]} keys - The keys to delete.
     * @returns {Promise<number>} The number of keys deleted.
     */
    public async deleteKeys(keys: string[]): Promise<number> {
        try {
            return await this.redisClient.del(keys);
        } catch (error) {
            console.error('deleteKeys Error:', error);
            return 0;
        }
    }

    /**
     * Retrieves the singleton instance of the CommunitiesCache.
     *
     * @returns {CommunitiesCache} The singleton instance.
     */
    public static getInstance(): CommunitiesCache {
        if (!CommunitiesCache.instance) {
            CommunitiesCache.instance = new CommunitiesCache();
        }

        return CommunitiesCache.instance;
    }
}