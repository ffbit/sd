'use strict';

const winston = require('winston');
const { format, transports } = winston;
const colorizer = format.colorize();

// https://github.com/winstonjs/winston/blob/master/examples/color-message.js
// https://github.com/winstonjs/winston/blob/master/examples/custom-timestamp.js
// https://github.com/winstonjs/winston/issues/1388

const loggerCheckBoxes = {
  'info': '✔',
  'error': '✘',
  'warn': '!'
};

const checkBox = (level) => {
  return '[' + (loggerCheckBoxes[level] || '*') + '] ';
}

const label = (lbl = '') => lbl === '' ? '' : `[${lbl}]`;

const createLogger = (lbl) => winston.createLogger({
  level: 'debug',
  transports: [
    new transports.Console({
      format: format.combine(
        format.splat(),
        format.errors({ stack: true }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss ZZ'
        }),
        format.printf(msg => colorizer.colorize(msg.level, `${msg.timestamp} ${checkBox(msg.level)}${label(lbl)}: ${msg.message}`))
      )}),
    new transports.File({ 
      filename: 'combined.log',
      format: format.combine(
        format.splat(),
        format.errors({ stack: true }),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss ZZ'
        }),
        format.printf(msg => `${msg.timestamp} ${checkBox(msg.level)}${label(lbl)}: ${msg.message}`)
      )
    })
  ]
});


module.exports = createLogger;
