'use strict';

const shutdownHook = (server) => {
  const handle = (signal) => {
    console.info(`Service is being shut down by signal: ${signal}`);
      server.close();
      process.exit();
    };
  process.on('SIGTERM', handle);
  process.on('SIGINT', handle);
};

module.exports = shutdownHook;
