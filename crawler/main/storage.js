'use strict';


// https://docs.datastax.com/en/developer/nodejs-driver/4.6/getting-started/
const cassandra = require('cassandra-driver');
const casandraHosts = (process.env.STORAGE_HOSTS || 'localhost').split(',');
const localDataCenter = (process.env.STORAGE_DATA_CENTER || 'datacenter1');
const logger = require('./logger')('STORAGE');
const errorHandler = require('./error-handler')(logger);

// https://github.com/datastax/nodejs-driver/blob/master/examples/metadata/metadata-table.js
const client = new cassandra.Client({
  contactPoints: casandraHosts,
  localDataCenter: localDataCenter
});

client.connect()
  .then(() => {
    const query = `
      CREATE KEYSPACE IF NOT EXISTS crawler WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 3
      };
    `;
    return client.execute(query);
  })
  .then((ks) => {
    client.keyspace = 'crawler';
    const query = `
      CREATE TABLE IF NOT EXISTS pages (
        url text PRIMARY KEY,
        content text,
        fetch_time timestamp,
        links set<text>
      );
    `;
    return client.execute(query);
  })
  .catch(errorHandler);

// https://cassandra.apache.org/doc/latest/cql/dml.html#update
// https://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/useInsertSet.html
// https://docs.datastax.com/en/dse/5.1/cql/cql/cql_using/upsertTimestamp.html
const insertPagesQuery = 'UPDATE pages SET content = ?, links = ?, fetch_time = toTimeStamp(now()) WHERE url = ?';
function savePage(url, content, links) {
  logger.debug(`saving page ${url}`);

  return client.execute(insertPagesQuery, [content, links, url], { prepare: true })
    .then((...results) => {
      logger.info(`saved page ${url}`);
      return results;
    }, errorHandler);
}


module.exports = { savePage };
