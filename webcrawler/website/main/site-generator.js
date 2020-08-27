'use strict';

const generate = process.env.PAGE_GEN === 'true';
const pageDir = process.env.PAGE_DIR || './public-generated';
const pageNum = +process.env.PAGE_NUM || 10000;
const minEdges = +process.env.PAGE_MIN_EDGES || 4;
const maxEdges = +process.env.PAGE_MAX_EDGES || 8;
const pageGraph = require('./page-graph');
const fs = require('fs');
const path = require('path');
const pug = require('pug');

function generateStaticSite(dir = pageDir) {
  if (fs.existsSync(dir) && !generate) {
    return dir;
  }

  const graph = pageGraph(pageNum, minEdges, maxEdges);

  fs.rmdirSync(dir, { recursive: true }, error => {
    console.log(error);
  });
  fs.mkdirSync(dir);
  
  console.log(`Generating static web pages in ${dir}:`);
  let filesWritten = 0;
  let pageIds = Object.keys(graph);
  pageIds.forEach(pageId => {
      let contents = pug.renderFile('./views/view.pug', {title: pageId, links: graph[pageId]});
      let filePath = path.join(dir, pageId + '.html');
      fs.writeFileSync(filePath, contents);
      
      filesWritten++;
      if (filesWritten % 500 == 0) {
        console.log(`  wrote ${filesWritten} / ${pageIds.length} web pages.`);
      }
    });
  console.log(`finished writing ${filesWritten} web pages.`);

  return dir;
}


module.exports = generateStaticSite;
