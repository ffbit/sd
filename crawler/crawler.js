'use strict';


// https://github.com/axios/axios/issues/1846
const http = require('http');
const httpAgent = new http.Agent({ keepAlive: true });
const axios = require('axios');
const axiosClient = axios.create({ httpAgent });

const urlQueue = process.env.URL_QUEUE || 'url_queue';
const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3000/';
const queuePrefetchCount = (+process.env.QUEUE_PREFETCH_COUNT || 16);

const createLogger = require('./main/logger');
const logger = createLogger('CRAWLER');

const linkParser = require('./main/link-parser');

const Queue = require('./main/queue');

const queue = new Queue(urlQueue, queuePrefetchCount);

const Lock = require('./main/lock');
const lock = new Lock();
const ingest = (url) => {
  return lock.lock(url, () => queue.ingest(url));
}

ingest(websiteUrl);

queue.subscribe(async (url) => {
  logger.info(`in the consumer ${url}`);

  const html = await fetch(url);
  // logger.info(`html ${html}`);

  const links = await linkParser(url, html);
  // logger.info('links %s', links.join(','));
  logger.info('parsed %s links from %s', links.length, url);

  links.forEach(ingest);

  return 'ok';
});

function fetch(url) {
  return axiosClient.get(url)
    .then(response => response, error => {
      logger.error(`failed to get url ${url} due to ${error.message}`);
      if (!error.response) {
        throw(error);
      }
      return error.response;
    }).then(response => response.data, handleError);
}

function handleError(error) {
  logger.error('error %s', error);
  throw(error);
}
