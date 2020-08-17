'use strict';

// https://github.com/NodeRedis/node-redis
// https://github.com/mike-marcacci/node-redlock

const redisHost = process.env.KEY_VALUE_STORAGE_HOST || 'localhost';

const redis = require('redis');
const Redlock = require('redlock');
let redlock = createRedlock();

function createRedlock() {
  return new Redlock([redis.createClient({host: redisHost})]);
}

function ttlPipeline(ttl) {
  return (data, asynFunctions = []) => {
    let handle = async (lock, asynFunction, ...args) => {
      let result = await asynFunction(data, ...args);
      return [lock, ...result];
    }
    let handleError = (error) => {
      throw(error);
    };
    let lockChain = redlock.lock(data.key, ttl)
      .then(lock => [lock]);
  
    asynFunctions.forEach((asynFunction) => {
      lockChain = lockChain.then(([lock, ...args]) => {
        return lock.extend(ttl)
          .then(extendedLock => handle(extendedLock, asynFunction, ...args), handleError);
      }, handleError);
    });
    return lockChain;
  }
}

module.exports = ttlPipeline;
