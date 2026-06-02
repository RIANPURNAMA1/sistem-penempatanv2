const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || '';

let redis = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    console.warn('[Redis] Connection error:', err.message);
  });

  redis.on('connect', () => {
    console.log('[Redis] Connected');
  });
}

const getRedis = () => redis;

const isRedisReady = () => {
  return redis && redis.status === 'ready';
};

module.exports = { getRedis, isRedisReady };
