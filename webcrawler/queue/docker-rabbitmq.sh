#!/usr/bin/env bash


docker run -ti --rm --name some-rabbit -p 8080:15672 -p 5672:5672 rabbitmq:3-management
