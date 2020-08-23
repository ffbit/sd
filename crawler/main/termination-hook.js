'use strict';

const logger = require('./logger')('PROCESS TERMINATION HOOK');

const handleProcessTermination = (signal, hook) => {
  logger.warn(`Service is being shut down by signal: ${signal}`);
  hook();
};

const addTerminationHook = (hook) => {
  ['SIGTERM', 'SIGINT']
    .forEach(signal => process.on(signal, (signal) => handleProcessTermination(signal, hook)));
};


module.exports = addTerminationHook;
