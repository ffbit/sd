FROM rabbitmq:3-management

RUN rabbitmq-plugins --offline enable rabbitmq_peer_discovery_etcd
COPY rabbitmq.conf /etc/rabbitmq/

## Add the wait script to the image
# https://github.com/ufoscout/docker-compose-wait
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait


CMD ["sh", "-c", "/wait && rabbitmq-server"]
