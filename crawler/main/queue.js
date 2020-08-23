'use strict';


// https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html
// https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html
// https://codefibershq.com/blog/rabbitmq-cluster-on-docker-with-nodejs-in-5-minutes
// https://www.cloudamqp.com/blog/2015-05-19-part2-2-rabbitmq-for-beginners_example-and-sample-code-node-js.html
const queueHosts = (process.env.QUEUE_HOSTS || 'localhost').split(',');
const amqp = require('amqp-connection-manager');
const connection = amqp.connect(queueHosts.map(host => 'amqp://' + host));

const createLogger = require('./logger');
const logger = createLogger('QUEUE');
const addTerminationHook = require('./termination-hook');


let sentCount = 0;
let ackedCount = 0;
let rejectedCount = 0;

const diagnosticsLogger = createLogger('DIAGNOSTICS');
const diagnostics = setInterval(() => {
  diagnosticsLogger.debug(`sent %s, acked %s, rejected %s, acked + rejected %s`, sentCount, ackedCount, rejectedCount, ackedCount + rejectedCount);
}, 1000);

function handleError(error) {
  logger.error(error);
  throw(error);
}

class Queue {

  constructor(queue, prefetchCount = 1) {
    this.queue = queue;
    this.channelWrapper = connection.createChannel({
      json: false,
      setup: channel => {
        channel.prefetch(prefetchCount);
    
        return channel.assertQueue(queue, {
          name: queue,
          durable: true,
          arguments: {
            'x-queue-mode': 'lazy',
            'queue-mode': 'lazy'
          }
        });
      }
    });
  }

  ingest(url) {
    return this.channelWrapper
      .sendToQueue(this.queue, Buffer.from(url), { persistent: true })
      .then((ok) => {
        logger.info(`url ${url} was sent to ${this.queue}`);
        sentCount++;
        return ok;
      }, handleError);
  }

  subscribe(consumer) {
    const onMessage = (channel) => {
      return (message) => {
        const content = message.content.toString();
        logger.debug(`=> ${content}`);
        const onResolve = (...args) => {
          channel.ack(message);
          ackedCount++;
          
          return args;
        };
        const onReject = (error) => {
          channel.reject(message);
          rejectedCount++;
          logger.error(`rejected ${content} due to`, error);
          
          throw(error);
        };

        return Promise.resolve(consumer(content))
          .then(onResolve, onReject);
      }
    }

    this.channelWrapper.addSetup((channel) => {
      logger.debug('setting up the channel');
      let options = { noAck: false, exclusive: false };
      // Promise.all([channel.consume(this.queue, handle(channel, consumer), options)]);
      Promise.all([channel.consume(this.queue, onMessage(channel), options).catch(logger.error)]);
    }).catch(logger.error);
  }
};


addTerminationHook(() => {
  connection.close();
  clearInterval(diagnostics);
});

module.exports = Queue;
