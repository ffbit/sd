'use strict';

const generate = Boolean(process.env.PAGE_GEN);
const pageNum = +process.env.PAGE_NUM || 10000;
const pageGraph = require('./page-graph');
const fs = require('fs');
const path = require('path');
const pug = require('pug');

function generateStaticSite(dir) {
  if (fs.existsSync(dir) && !generate) {
    return dir;
  }

  const graph = pageGraph(pageNum);

  fs.rmdirSync(dir, { recursive: true }, error => {
    console.log(error);
  });
  fs.mkdirSync(dir);
  
  console.log('Generating static web pages:');
  let filesWritten = 0;
  let pageIds = Object.keys(graph);
  pageIds.forEach(pageId => {
      let contents = pug.renderFile('./views/view.pug', {title: pageId, links: graph[pageId]});
      let filePath = path.join(dir, pageId + '.html');
      fs.writeFileSync(filePath, contents);
      
      filesWritten++;
      if (filesWritten % 1000 == 0) {
        console.log(`  wrote ${filesWritten} / ${pageIds.length} web pages.`);
      }
    });
  console.log(`finished writing ${filesWritten} web pages.`);

  return dir;
}


module.exports = generateStaticSite;
