'use strict';

const rnd = require('./rnd');
const Heap = require('heap');

function pageGraph(pageNum, minEdges, maxEdges, graph = {'index': []}, idLength = 40) {
  for (let i = 0; i < pageNum; i++) {
    let id = rnd.randomId(idLength);
    while (id in graph) {
      id = rnd.randomId(idLength);
    }
    graph[id] = [];
  }

  const heap = new Heap((a, b) => a.count - b.count);
  Object.keys(graph)
    .forEach(id => heap.push({id, count: 0}));
  Object.keys(graph)
    .forEach(id => {
      let edgeCount = rnd.randomInt(minEdges, maxEdges + 1);
      let edges = [];
      for (let i = 0; i < edgeCount && !heap.empty(); i++) {
        edges.push(heap.pop());
      }
      graph[id] = edges.map(e => e.id);
      edges.forEach(e => {
        e.count++;
        heap.push(e);
      });
    });
  
  logDistribution(graph);
  
  return graph;
}

function logDistribution(graph) {
  const counts = {};
  let total = 0;
  Object.values(graph).forEach(e => {
    let count = e.length;
    counts[count] = +counts[count] || 0;
    counts[count]++;
    total++;
  });

  console.log(`Edge count distribution of total ${total} edges:`);
  Object.keys(counts)
    .forEach(k => console.log(`  ${k} -> ${counts[k]}`));
}


module.exports = pageGraph;
