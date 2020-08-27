#!/usr/bin/env bash

docker run -ti --rm --name some-cassandra -p 7000:7000 -p 9042:9042 cassandra:3
