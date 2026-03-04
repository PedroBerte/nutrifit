import Redis from "ioredis";

let _redis: Redis | null = null;
let _loggedRedisError = false;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 250, 2000),
    });

    _redis.on("error", (error) => {
      if (_loggedRedisError) return;
      _loggedRedisError = true;
      console.warn("[Redis] Connection unavailable. Falling back where supported.", error.message);
      setTimeout(() => {
        _loggedRedisError = false;
      }, 5000);
    });
  }
  return _redis;
}
