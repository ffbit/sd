'use strict';


function errorHandler(logger) {
  return (error) => {
    logger.error('=>', error);
    throw(error);
  }
}


module.exports = errorHandler;
