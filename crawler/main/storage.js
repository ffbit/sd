'use strict';


// https://docs.datastax.com/en/developer/nodejs-driver/4.6/getting-started/
const cassandra = require('cassandra-driver');
const casandraHosts = (process.env.STORAGE_HOSTS || 'localhost').split(',');
const logger = require('./logger')('STORAGE');

// select data_center from system.local;
const client = new cassandra.Client({
  contactPoints: casandraHosts,
  keyspace: 'crawler',
  localDataCenter: 'datacenter1'
});

client.connect();

// https://cassandra.apache.org/doc/latest/cql/dml.html#update
// https://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useInsertSet.html
// https://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/upsertTimestamp.html
const insertPagesQuery = 'UPDATE pages SET content = ?, links = ?, fetch_time = toTimeStamp(now()) WHERE url = ?';
function savePage(url, content, links) {
  logger.debug(`saving page ${url}`);
  return client.execute(insertPagesQuery, [content, links, url], { prepare: true });
}


module.exports = { savePage };