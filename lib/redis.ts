import Redis, { RedisOptions } from "ioredis";

export function createRedisInstance() {
  try {
    const options: RedisOptions = {
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: +process.env.REDIS_PORT!,
      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      retryStrategy: (times: number) => {
        if (times > 3) {
          throw new Error(`[Redis] Could not connect after ${times} attempts`);
        }

        return Math.min(times * 200, 1000);
      },
    };

    const redis = new Redis(options);

    redis.on("error", (error) => {
      // eslint-disable-next-line no-console
      console.warn("[Redis] Error connecting", error);
    });

    return redis;
  } catch (e) {
    throw new Error(`[Redis] Could not create a Redis instance`);
  }
}
