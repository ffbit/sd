'use strict';


// https://github.com/NodeRedis/node-redis
const redisHost = process.env.KEY_VALUE_STORAGE_HOST || 'localhost';
const redis = require('redis');
const addTerminationHook = require('./termination-hook');
const logger = require('./logger')('REDIS');

const createRedisClient = () => {
  const redisClient = redis.createClient({host: redisHost});
  redisClient.on('error', function(error){ 
    logger.error('Redis error: %s', error.message); 
  });
  redisClient.on('reconnecting', () => {
    logger.warn('redis is trying to reconnect');
  });
  redisClient.on('ready', () => {
    logger.info('ready');
  });
  addTerminationHook(() => {
    logger.warn('quitting');
    redisClient.quit(false);
  });

  return redisClient;
}


module.exports = createRedisClient;
