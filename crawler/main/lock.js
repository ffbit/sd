'use strict';


// https://github.com/mike-marcacci/node-redlock
// https://github.com/NodeRedis/node-redis
const redisHost = process.env.KEY_VALUE_STORAGE_HOST || 'localhost';
const addTerminationHook = require('./termination-hook');
const redis = require('redis');
const redisClient = createRedisClient();
const Redlock = require('redlock');
const redlock = new Redlock([redisClient]);
const logger = require('./logger')('LOCK');
const errorHandler = require('./error-handler')(logger);
const { promisify } = require('util');
const persistAsync = promisify(redisClient.persist).bind(redisClient);
const ttl = (+process.env.LOCK_TTL || 4000);


function persist(resource, result) {
  logger.info('about to persist %s', resource);
  return persistAsync(resource)
    .then((status) => {
      logger.debug(`persisted locked resource ${resource} ${status}`);
      if (!status) {
        logger.warn(`failed to persist resource ${resource} within a TTL of ${ttl}, status: ${status}, consider increasing the TTL`);
      }

      return result;
    }, errorHandler);
}

function unlock(lock, data, error) {
  lock.unlock();
  loggers.error('Unlocking resource %s due to %s', data, error.message);
  errorHandler(error);
}

class Lock {
  lock(data, action) {
    logger.info(data);
    const resource = 'crawler_lock:' + data;

    return redlock.lock(resource, ttl)
      .then((lock) => {
        logger.debug('locked on %s', data);
        return Promise.resolve(action(data))
          .then((result) => persist(resource, result), error => unlock(lock, data, error));
      }, errorHandler)
      .catch(error => logger.error('->', error));
  }
}

function createRedisClient() {
  const redisClient = redis.createClient({host: redisHost});
  redisClient.on('error', function(error) {
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


module.exports = Lock;
