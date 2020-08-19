'use strict';

const axios = require('axios').default;

const queueHosts = (process.env.QUEUE_HOSTS || 'localhost').split(',');
const urlQueue = process.env.URL_QUEUE || 'url_queue';
const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3000/';

// https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html
// https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html
// https://codefibershq.com/blog/rabbitmq-cluster-on-docker-with-nodejs-in-5-minutes
// https://www.cloudamqp.com/blog/2015-05-19-part2-2-rabbitmq-for-beginners_example-and-sample-code-node-js.html
const amqp = require('amqp-connection-manager');
var connection = amqp.connect(queueHosts.map(host => 'amqp://' + host));


const urlChannel = connection.createChannel({
  json: false,
  setup: channel => {
    return channel.assertQueue(urlQueue, {
      name: urlQueue,
      durable: true
    });
  }
});

const sendToUrlQueue = (url) => {
  urlChannel.sendToQueue(urlQueue, Buffer.from(url), {persistent: true})
    .then(() => console.log(`sent to ${urlQueue}: ${url}`))
    .catch(error => console.error(error));
}
sendToUrlQueue(websiteUrl);

class PipelineTask {
  constructor(url) {
    this.url = url;
    this.key = `crawler-key:${url}`;
  }
}

const ttl = +(process.env.PIPELINE_TTL || 1000);
const ttlPipeline = require('./main/ttl-pipeline');
const pipeline = ttlPipeline(ttl);

let handleError = (error) => {
  console.error(error);
  throw(error);
};

urlChannel.addSetup((channel) => {
  let options = {noAck: false, exclusive: true};
  let consumer = channel.consume(urlQueue, handleUrl(channel), options);
  Promise.all([consumer]);
});

function handleUrl(channel) {
  return (msg) => start(msg.content.toString())
    .then(() => channel.ack(msg), handleError);
}

async function start(url) {
  return pipeline(new PipelineTask(url), [fetch, parse, ingest, store]);
}

function fetch(task) {
  console.log(`fetching: ${task.url}`);
  return axios.get(task.url)
    .then(response => {
        if (response.status == 200) {
          return [response.data];
        }
        throw(new Error(`Bad response status  code: ${response.status}`));
      }, handleError)
    .catch(error => {
      console.error(error);
      throw(error);
    });
}

const linkParser = require('./main/link-parser');
async function parse(task, pageContents) {
  return [pageContents, ...linkParser(task.url, pageContents)];
}

async function ingest(task, pageContents, ...urls) {
  console.log('ingesting:', task, pageContents, ...urls);
  return [pageContents, ...urls];
}

async function store(task, pageContents, ...urls) {
  console.log('storing:', task, pageContents, urls);
  return [];
}
