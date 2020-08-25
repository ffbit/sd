'use strict';


const createLogger = require('./main/logger');
const logger = createLogger('CRAWLER');

// https://github.com/axios/axios/issues/1846
const http = require('http');
const httpAgent = new http.Agent({ keepAlive: true });
const axios = require('axios');
const axiosClient = axios.create({ httpAgent });

const urlQueue = process.env.URL_QUEUE || 'url_queue';
const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3000/';
const queuePrefetchCount = +process.env.QUEUE_PREFETCH_COUNT || 16;
const queue = require('./main/queue')(urlQueue, queuePrefetchCount);
const storage = require('./main/storage');
const linkParser = require('./main/link-parser');


queue.ingest(websiteUrl);

queue.subscribe(async (url) => {
  logger.info(`in the consumer ${url}`);

  const html = await fetch(url);

  const links = await linkParser(url, html);
  logger.info('parsed %s links from %s', links.length, url);

  await Promise.allSettled(links.map((url) => queue.ingest(url)));
  // await links.map((url) => queue.ingest(url));

  await storage.savePage(url, html, links);

  return 'ok';
});

function fetch(url) {
  return axiosClient.get(url)
    .then(response => response, error => {
      logger.error(`failed to get url ${url} due to ${error.message}`);
      if (!error.response) {
        handleError(error);
      }
      return error.response;
    }).then(response => response.data, handleError);
}

function handleError(error) {
  logger.error('error %s', error);
  throw(error);
}
