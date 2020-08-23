'use strict';


// https://github.com/mike-marcacci/node-redlock

const createRedisClient = require('./redis-client');
const redisClient = createRedisClient();
const Redlock = require('redlock');
const redlock = new Redlock([redisClient]);
const logger = require('./logger')('LOCK');
const { promisify } = require('util');
const persistAsync = promisify(redisClient.persist).bind(redisClient);
const ttl = (+process.env.PIPELINE_TTL || 4000);

function handleError(error) {
  logger.error(error);
  throw(error);
}

function persist(resource, result) {
  return persistAsync(resource)
    .then((status) => {
      logger.debug(`persisted locked resource ${resource} ${status}`);
      if (!status) {
        logger.warn(`failed to persist resource ${resource}, status: ${status} `);
      }
      return result;
    }, handleError);
}

function unlock(lock, data, error) {
  lock.unlock();
  loggers.error('Unlocking resource %s due to %s', data, error.message);
  handleError(error);
}

class Lock {
  lock(data, action) {
    logger.info(data);
    const resource = 'lock:' + data;
    return redlock.lock(resource, ttl)
      .then((lock) => {
        logger.debug('locked on %s', data);
        return Promise.resolve(action(data))
          .then((result) => persist(resource, result), error => unlock(lock, data, error));
      }, handleError)
      .catch(logger.error);
  }
}


module.exports = Lock;
