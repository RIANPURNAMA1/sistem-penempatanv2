const { getRedis, isRedisReady } = require('../config/redis');

const DEFAULT_TTL = 30;

const get = async (key) => {
  try {
    const redis = getRedis();
    if (!redis || !isRedisReady()) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn('[Cache] Get error:', err.message);
    return null;
  }
};

const set = async (key, data, ttl = DEFAULT_TTL) => {
  try {
    const redis = getRedis();
    if (!redis || !isRedisReady()) return;
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.warn('[Cache] Set error:', err.message);
  }
};

const del = async (...keys) => {
  try {
    const redis = getRedis();
    if (!redis || !isRedisReady()) return;
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn('[Cache] Del error:', err.message);
  }
};

const delByPrefix = async (prefix) => {
  try {
    const redis = getRedis();
    if (!redis || !isRedisReady()) return;
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn('[Cache] DelByPrefix error:', err.message);
  }
};

const generateKey = (prefix, req) => {
  const query = req.query ? JSON.stringify(req.query, Object.keys(req.query).sort()) : '';
  const params = req.params && req.params.id ? `:${req.params.id}` : '';
  return `${prefix}${params}:${query}`;
};

module.exports = { get, set, del, delByPrefix, generateKey };
