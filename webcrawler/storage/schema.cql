DROP KEYSPACE IF EXISTS crawler;

CREATE KEYSPACE crawler WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 3
};

USE crawler;

CREATE TABLE pages (
  url text PRIMARY KEY,
  content text,
  fetch_time timestamp,
  links set<text>
);
