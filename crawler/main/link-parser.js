'use strict';

const net = require('net');
const htmlparser2 = require("htmlparser2");

function linkParser(base, html) {
  const baseUrl = new URL(base);
  const urls = [];
  
  const parser = new htmlparser2.Parser({
    onopentag(name, attribs) {
      if (name === 'a' && attribs.href) {
        let url = new URL(attribs.href, baseUrl);
        if (baseUrl.origin === url.origin) {
          urls.push(url.href);
        }
      }
    }
  }, { decodeEntities: true });
  parser.parseComplete(html);
  parser.end();

  return urls;
}


module.exports = linkParser;
