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
const errorHandler = require('./error-handler');
const Lock = require('./lock');
const lock = new Lock();

function createQueue(queueName, prefetchCount) {
  queueHosts.forEach(host => logger.info(`host ${host}`));

  let sentCount = 0;
  let ackedCount = 0;
  let rejectedCount = 0;

  const diagnosticsLogger = createLogger(`DIAGNOSTICS ${queueName} ${Date.now()}`);
  const diagnostics = setInterval(() => {
    diagnosticsLogger.debug(`sent %s, acked %s, rejected %s, acked + rejected %s`,
      sentCount, ackedCount, rejectedCount, ackedCount + rejectedCount);
  }, 1000);

  addTerminationHook(() => {
    clearInterval(diagnostics);
  });

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

      const self = this;
      addTerminationHook(() => {
        self.channelWrapper.close();
      });
    }

    ingest(url) {
      const self = this;
      return lock.lock(url, () => self.__ingest(url));
    }

    __ingest(url) {
      return this.channelWrapper
        .sendToQueue(this.queue, Buffer.from(url), { persistent: true })
        .then((ok) => {
          logger.info(`url ${url} was sent to ${this.queue}`);
          sentCount++;
          return ok;
        }, errorHandler);
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
        Promise.all([channel.consume(this.queue, onMessage(channel), options).catch(logger.error)]);
      }).catch(logger.error);
    }
  }

  return new Queue(queueName, prefetchCount);
}

addTerminationHook(() => {
  connection.close();
});


module.exports = createQueue;
