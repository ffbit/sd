#!/usr/bin/env bash

docker run --rm -it --name some-redis -p 6379:6379 \
           -v redis6.conf:/usr/local/etc/redis/redis.conf \
           redis:6 redis-server /usr/local/etc/redis/redis.conf
