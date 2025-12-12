const Redis = require('ioredis');
const logger = require('../utils/logger');
let redis;


async function initRedis(url) {
    if (!url) throw new Error('REDIS_URL not set');
    redis = new Redis(url);
    await redis.ping();
    logger.info('Redis connected');
}


function getRedis() {
    if (!redis) throw new Error('Redis not initialized');
    return redis;
}


module.exports = { initRedis, getRedis };